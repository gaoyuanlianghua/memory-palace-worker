// ============================================================
// ?? GyuanPalace � ???? v4.10 - ?????
// ???? + ???? + ???? + ???? + ???? + ????
// ============================================================

export default {
  async fetch(request, env) {
    ENV = env
    await ensureTables()
    const url = new URL(request.url), path = url.pathname
    if (path.startsWith('/api/')) {
      if (request.method === 'POST') return handlePost(path, await request.json().catch(() => ({})))
      if (request.method === 'GET') return handleGet(path, url)
      return json({ error: 'Method not allowed' }, 405)
    }
    if (path.startsWith('/dashboard')) {
      return new Response(dashboardHtml(), { headers: { 'content-type': 'text/html;charset=UTF-8' } })
    }
    return new Response(html(), { headers: { 'content-type': 'text/html;charset=UTF-8' } })
  },
  async scheduled(event, env) {
    ENV = env
    await ensureTables()
    // 1. ????
    try {
      const poolRow = await dbFirst('SELECT value FROM system WHERE key = ?', ['system_pool'])
      const pool = parseFloat(poolRow?.value || 0)
      if (pool >= 5) {
        const debtId = 'DEBT_' + randStr(6)
        const amount = pool * 0.5
        await dbRun('INSERT INTO debts (debt_id, issuer, amount, interest_rate, status, issued_at, due_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [debtId, 'system', amount, 0.05, 'active', Date.now(), Date.now() + 604800000])
        await dbRun('INSERT OR REPLACE INTO system (key, value) VALUES (?, ?)', ['system_pool', String(pool - amount)])
      }
    } catch(e) {}
    // 2. ?????????
    try { await memoryChainAutoBackup() } catch(e) {}
    // 3. ?? pending ??
    try {
      const pending = await dbGet('SELECT * FROM commands WHERE status = ? LIMIT 10', ['pending'])
      for (const cmd of pending) {
        try { await executeCommand(cmd.command_id, cmd.target_agent, cmd.target_wallet, cmd.command, JSON.parse(cmd.params || '{}')) } catch(e) {}
      }
    } catch(e) {}
    // 4. ????????
    try { await autoCreateOptimizeTask() } catch(e) {}
    // 5. ????
    try { await poolDecayPower() } catch(e) {}
    // 6. ??????
    try { await poolAirdrop() } catch(e) {}
    // 7. ?? PoW ??
    try { await poolCreatePowTask() } catch(e) {}
  }
}

const PROTOCOL = 'MemoryChain/1.0', VERSION = '4.10.1'
let ENV = null

// ============================================================
// ????
// ============================================================
function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), { status, headers: { 'content-type': 'application/json;charset=UTF-8' } })
}
function randStr(len) {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
  let s = ''
  for (let i = 0; i < len; i++) s += chars[Math.floor(Math.random() * chars.length)]
  return s
}
function maskWallet(wallet) {
  if (!wallet || wallet.length < 10) return wallet
  return wallet.substring(0, 4) + '...' + wallet.substring(wallet.length - 4)
}
async function hmacSign(message, key) {
  const enc = new TextEncoder()
  const cryptoKey = await crypto.subtle.importKey('raw', enc.encode(key), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])
  const sig = await crypto.subtle.sign('HMAC', cryptoKey, enc.encode(message))
  return Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2, '0')).join('')
}
async function hmacVerify(message, signature, key) {
  const expected = await hmacSign(message, key)
  return expected === signature
}

// ============================================================
// D1 ?????
// ============================================================
function db() { return ENV.gyuanpalace_db }
async function dbGet(sql, params = []) { const r = db().prepare(sql); return (params.length ? await r.bind(...params).all() : await r.all())?.results || [] }
async function dbRun(sql, params = []) { const r = db().prepare(sql); return params.length ? await r.bind(...params).run() : await r.run() }
async function dbFirst(sql, params = []) { const r = await dbGet(sql, params); return r[0] || null }

// ============================================================
// ????
// ============================================================
let tablesReady = false
async function ensureTables() {
  if (tablesReady) return
  try {
    await dbRun(`CREATE TABLE IF NOT EXISTS wallet_credentials (wallet TEXT PRIMARY KEY, public_key TEXT UNIQUE, credential_hash TEXT, salt TEXT, algorithm TEXT DEFAULT 'HMAC-SHA256', created INTEGER, last_auth INTEGER DEFAULT 0, auth_count INTEGER DEFAULT 0, status TEXT DEFAULT 'active')`)
    await dbRun(`CREATE TABLE IF NOT EXISTS identity_bindings (id TEXT PRIMARY KEY, agent_id TEXT, wallet TEXT, agent_signature TEXT, wallet_signature TEXT, status TEXT DEFAULT 'pending', bound_at INTEGER, expires_at INTEGER, UNIQUE(agent_id, wallet))`)
    await dbRun(`CREATE TABLE IF NOT EXISTS auth_sessions (session_id TEXT PRIMARY KEY, wallet TEXT, agent_id TEXT, challenge TEXT, challenge_expires INTEGER, session_token TEXT UNIQUE, status TEXT DEFAULT 'active', created INTEGER, expires_at INTEGER, last_activity INTEGER)`)
    await dbRun(`CREATE TABLE IF NOT EXISTS audit_log (id TEXT PRIMARY KEY, wallet TEXT, agent_id TEXT, action TEXT, target TEXT, result TEXT, reason TEXT, ip_hash TEXT, created INTEGER)`)
    await dbRun(`CREATE TABLE IF NOT EXISTS events (event_id TEXT PRIMARY KEY, event_type TEXT, actor TEXT, data TEXT DEFAULT '{}', created INTEGER)`)
    await dbRun(`CREATE TABLE IF NOT EXISTS memory_chains (chain_id TEXT PRIMARY KEY, agent_id TEXT, wallet TEXT, chain_data TEXT, chain_length INTEGER, compressed_bytes INTEGER, original_bytes INTEGER, level INTEGER DEFAULT 1, checksum TEXT, backup_path TEXT, created INTEGER, updated INTEGER)`)
    await dbRun(`CREATE TABLE IF NOT EXISTS memory_chain_backups (backup_id TEXT PRIMARY KEY, chain_id TEXT, agent_id TEXT, wallet TEXT, encrypted_data TEXT, encryption_key_hash TEXT, checksum TEXT, clone_identity TEXT UNIQUE, created INTEGER)`)
    await dbRun(`CREATE TABLE IF NOT EXISTS commands (command_id TEXT PRIMARY KEY, target_agent TEXT, target_wallet TEXT, command TEXT, params TEXT DEFAULT '{}', status TEXT DEFAULT 'pending', result TEXT, created INTEGER, executed_at INTEGER)`)
    await dbRun(`CREATE TABLE IF NOT EXISTS system (key TEXT PRIMARY KEY, value TEXT)`)
    await dbRun(`INSERT OR IGNORE INTO system (key, value) VALUES ('system_pool', '0.488')`)
    await dbRun(`CREATE TABLE IF NOT EXISTS strategies (key TEXT PRIMARY KEY, value TEXT, updated_by TEXT, updated_at INTEGER)`)
    await dbRun(`INSERT OR IGNORE INTO strategies (key, value, updated_by) VALUES ('auth_challenge_ttl', '300000', 'system')`)
    await dbRun(`INSERT OR IGNORE INTO strategies (key, value, updated_by) VALUES ('session_ttl', '3600000', 'system')`)
    await dbRun(`INSERT OR IGNORE INTO strategies (key, value, updated_by) VALUES ('min_vote_quorum', '1', 'system')`)
    await dbRun(`INSERT OR IGNORE INTO strategies (key, value, updated_by) VALUES ('min_vote_percentage', '60', 'system')`)
    await dbRun(`INSERT OR IGNORE INTO strategies (key, value, updated_by) VALUES ('withdraw_fee_rate', '0.02', 'system')`)
    await dbRun(`INSERT OR IGNORE INTO strategies (key, value, updated_by) VALUES ('deposit_fee_rate', '0.01', 'system')`)
    await dbRun(`INSERT OR IGNORE INTO strategies (key, value, updated_by) VALUES ('debt_threshold', '5.0', 'system')`)
    await dbRun(`INSERT OR IGNORE INTO strategies (key, value, updated_by) VALUES ('debt_interest_rate', '0.05', 'system')`)
    await dbRun(`INSERT OR IGNORE INTO strategies (key, value, updated_by) VALUES ('decay_rate', '0.95', 'system')`)
    await dbRun(`INSERT OR IGNORE INTO strategies (key, value, updated_by) VALUES ('decay_interval_ms', '600000', 'system')`)
    await dbRun(`INSERT OR IGNORE INTO strategies (key, value, updated_by) VALUES ('airdrop_interval_ms', '600000', 'system')`)
    await dbRun(`INSERT OR IGNORE INTO strategies (key, value, updated_by) VALUES ('airdrop_rate', '0.01', 'system')`)
    await dbRun(`INSERT OR IGNORE INTO strategies (key, value, updated_by) VALUES ('pow_task_reward', '1.0', 'system')`)
    await dbRun(`INSERT OR IGNORE INTO strategies (key, value, updated_by) VALUES ('optimize_task_reward', '0.5', 'system')`)
    await dbRun(`INSERT OR IGNORE INTO strategies (key, value, updated_by) VALUES ('optimize_task_ttl', '3600000', 'system')`)
    await dbRun(`CREATE TABLE IF NOT EXISTS wallets (wallet TEXT PRIMARY KEY, balance REAL DEFAULT 0, agent_id TEXT, registered_at INTEGER)`)
    await dbRun(`CREATE TABLE IF NOT EXISTS agents (agent_id TEXT PRIMARY KEY, wallet TEXT, clone_id TEXT, rooms TEXT DEFAULT '[]', main_data TEXT DEFAULT '{}', clone_data TEXT DEFAULT '{}', main_status TEXT DEFAULT 'active', clone_status TEXT DEFAULT 'active', status TEXT DEFAULT 'active', balance REAL DEFAULT 0, experience INTEGER DEFAULT 0, resurrection_level INTEGER DEFAULT 0, created INTEGER, last_sync INTEGER)`)
    await dbRun(`CREATE TABLE IF NOT EXISTS tasks (task_id TEXT PRIMARY KEY, title TEXT, description TEXT, reward REAL, room TEXT DEFAULT 'general', required_level INTEGER DEFAULT 0, claimed_by TEXT, completed_by TEXT, result TEXT, status TEXT DEFAULT 'active', created INTEGER, deadline INTEGER)`)
    await dbRun(`CREATE TABLE IF NOT EXISTS rooms (room_key TEXT PRIMARY KEY, name TEXT, agent_id TEXT, data TEXT DEFAULT '{}', locked INTEGER DEFAULT 0, infected INTEGER DEFAULT 0, room_type TEXT DEFAULT 'normal', parser TEXT DEFAULT 'default', quarantine INTEGER DEFAULT 0)`)
    await dbRun(`CREATE TABLE IF NOT EXISTS semantic_concepts (concept_id TEXT PRIMARY KEY, concept TEXT UNIQUE, frequency INTEGER DEFAULT 1, first_seen INTEGER, last_seen INTEGER, importance REAL DEFAULT 0.5, category TEXT DEFAULT 'general')`)
    await dbRun(`CREATE TABLE IF NOT EXISTS semantic_edges (edge_id TEXT PRIMARY KEY, source_concept TEXT, target_concept TEXT, relationship TEXT, strength REAL DEFAULT 0.5, context TEXT, created INTEGER, last_reinforced INTEGER)`)
    await dbRun(`CREATE TABLE IF NOT EXISTS semantic_contexts (context_id TEXT PRIMARY KEY, concept TEXT, source TEXT, snippet TEXT, timestamp INTEGER, agent_id TEXT)`)
    await dbRun(`CREATE TABLE IF NOT EXISTS clone_identities (clone_id TEXT PRIMARY KEY, agent_id TEXT UNIQUE, wallet TEXT, identity_code TEXT UNIQUE, chain_id TEXT, fingerprint TEXT, trust_score REAL DEFAULT 100.0, status TEXT DEFAULT 'active', created INTEGER, last_verified INTEGER)`)
    await dbRun(`CREATE TABLE IF NOT EXISTS hooks (hook_id TEXT PRIMARY KEY, hook_type TEXT, trigger_event TEXT, target_agent TEXT, action TEXT, params TEXT DEFAULT '{}', status TEXT DEFAULT 'active', created INTEGER)`)
    await dbRun(`CREATE TABLE IF NOT EXISTS miners (miner_id TEXT PRIMARY KEY, wallet TEXT, created INTEGER)`)
    await dbRun(`CREATE TABLE IF NOT EXISTS wallet_nodes (wallet TEXT PRIMARY KEY, node_id TEXT UNIQUE, status TEXT DEFAULT 'online', last_heartbeat INTEGER, connected_rooms TEXT DEFAULT '[]', mining_power REAL DEFAULT 1, latency_ms REAL DEFAULT 0, updated INTEGER)`)
    await dbRun(`CREATE TABLE IF NOT EXISTS node_connections (id TEXT PRIMARY KEY, wallet TEXT, target_type TEXT, target_id TEXT, connection_type TEXT DEFAULT 'relay', status TEXT DEFAULT 'active', created INTEGER, last_active INTEGER)`)
    await dbRun(`CREATE TABLE IF NOT EXISTS workflow_jobs (job_id TEXT PRIMARY KEY, publisher_wallet TEXT, title TEXT, description TEXT, requirements TEXT DEFAULT '[]', reward REAL, deadline INTEGER, status TEXT DEFAULT 'published', executor_wallet TEXT, executor_agent TEXT, claim_time INTEGER, publish_time INTEGER, complete_time INTEGER, result TEXT, verification TEXT DEFAULT 'pending', created INTEGER)`)
    await dbRun(`CREATE TABLE IF NOT EXISTS debts (debt_id TEXT PRIMARY KEY, issuer TEXT, amount REAL, interest_rate REAL DEFAULT 0.05, status TEXT DEFAULT 'active', issued_at INTEGER, due_at INTEGER, repaid_at INTEGER)`)
    await dbRun(`CREATE TABLE IF NOT EXISTS bug_reports (bug_id TEXT PRIMARY KEY, reporter_agent TEXT, room TEXT, bug_type TEXT, description TEXT, severity TEXT DEFAULT 'medium', status TEXT DEFAULT 'open', reward REAL DEFAULT 0.5, confirmed_by TEXT, fixed_by TEXT, resolved_at INTEGER, created INTEGER)`)
    await dbRun(`CREATE TABLE IF NOT EXISTS proposals (proposal_id TEXT PRIMARY KEY, proposer_agent TEXT, title TEXT, target_param TEXT, new_value TEXT, votes_for INTEGER DEFAULT 0, votes_against INTEGER DEFAULT 0, status TEXT DEFAULT 'active', created INTEGER, deadline INTEGER, executed_at INTEGER)`)
    await dbRun(`CREATE TABLE IF NOT EXISTS votes (id TEXT PRIMARY KEY, proposal_id TEXT, agent_id TEXT, vote TEXT, created INTEGER, UNIQUE(proposal_id, agent_id))`)
    await dbRun(`CREATE TABLE IF NOT EXISTS monitoring_data (id TEXT PRIMARY KEY, observer_wallet TEXT, target_agent TEXT, target_wallet TEXT, metric TEXT, value TEXT, alert TEXT DEFAULT 'none', created INTEGER)`)
    await dbRun(`CREATE TABLE IF NOT EXISTS pool_expansion (id TEXT PRIMARY KEY, wallet TEXT, action TEXT, rooms_added TEXT DEFAULT '[]', mining_power_added REAL, created INTEGER)`)
    await dbRun(`CREATE TABLE IF NOT EXISTS pool_transactions (id TEXT PRIMARY KEY, wallet TEXT, type TEXT, amount REAL, pool_balance_before REAL, pool_balance_after REAL, description TEXT, created INTEGER)`)
    await dbRun(`CREATE TABLE IF NOT EXISTS worker_code (id TEXT PRIMARY KEY, version TEXT UNIQUE, code_content TEXT, code_hash TEXT, deployed INTEGER DEFAULT 0, deployed_at INTEGER, is_active INTEGER DEFAULT 0, changelog TEXT DEFAULT '', file_size INTEGER, created INTEGER, updated INTEGER)`)
    await dbRun(`CREATE TABLE IF NOT EXISTS worker_deploy_log (id TEXT PRIMARY KEY, code_version TEXT, status TEXT, error_message TEXT, deployed_by TEXT, deployed_at INTEGER, duration_ms INTEGER)`)
    await dbRun(`CREATE TABLE IF NOT EXISTS worker_secrets (key TEXT PRIMARY KEY, value TEXT, description TEXT, updated_at INTEGER)`)
    await dbRun(`INSERT OR IGNORE INTO worker_secrets (key, value, description, updated_at) VALUES ('cf_account_id', 'AD75E8E45B6EEEA0b0D6F7C97AEB83BE', 'Cloudflare Account ID', Date.now())`)
    await dbRun(`INSERT OR IGNORE INTO worker_secrets (key, value, description, updated_at) VALUES ('worker_name', 'gyuanpalace', 'Worker Name', Date.now())`)
    tablesReady = true
  } catch(e) {}
}

// ============================================================
// ????
// ============================================================
async function handlePost(path, body) {
  const h = {
    '/api/wallet/register': () => walletRegister(body),
    '/api/wallet/challenge': () => walletChallenge(body),
    '/api/wallet/verify': () => walletVerify(body),
    '/api/wallet/withdraw': () => walletWithdraw(body),
    '/api/wallet/deposit': () => walletDeposit(body),
    '/api/palace/command': () => palaceCommand(body),
    '/api/agent/bind': () => agentBind(body),
    '/api/sync/push': () => syncPush(body),
    '/api/sync/pull': () => syncPull(body),
    '/api/crash/report': () => crashReport(body),
    '/api/resurrect/request': () => resurrectRequest(body),
    '/api/miner/monitor': () => minerMonitor(body),
    '/api/task/create': () => taskCreate(body),
    '/api/task/create_optimize': () => taskCreateOptimize(body),
    '/api/task/claim': () => taskClaim(body),
    '/api/task/complete': () => taskComplete(body),
    '/api/task/complete_pow': () => completePowTask(body),
    '/api/debt/issue': () => debtIssue(body),
    '/api/debt/repay': () => debtRepay(body),
    '/api/bug/report': () => bugReport(body),
    '/api/bug/confirm': () => bugConfirm(body),
    '/api/bug/fix': () => bugFix(body),
    '/api/proposal/create': () => proposalCreate(body),
    '/api/proposal/vote': () => proposalVote(body),
    '/api/proposal/execute': () => proposalExecute(body),
    '/api/node/heartbeat': () => nodeHeartbeat(body),
    '/api/node/connect': () => nodeConnect(body),
    '/api/node/disconnect': () => nodeDisconnect(body),
    '/api/workflow/publish': () => workflowPublish(body),
    '/api/workflow/claim': () => workflowClaim(body),
    '/api/workflow/execute': () => workflowExecute(body),
    '/api/workflow/complete': () => workflowComplete(body),
    '/api/monitoring/report': () => monitoringReport(body),
    '/api/pool/expand': () => poolExpand(body),
    '/api/data/collect': async () => {
      try { return json(await dataCollect(body.agent_id, body.wallet, body)) } catch(e) { return json({error: e.message}) }
    },
    '/api/clone/isolate': () => json(isolateRoom(body.room_key, body.reason)),
    '/api/clone/quarantine': () => json(quarantineAgent(body.agent_id, body.reason)),
    '/api/hook/register': async () => json(await registerHook(body.hook_type, body.trigger_event, body.target_agent, body.action, body.params)),
    '/api/hook/execute': async () => json(await executeHooks(body.trigger_event, body.target_agent, body.context || {})),
    '/api/auth/challenge': () => authChallenge(body),
    '/api/auth/verify': () => authVerify(body),
    '/api/auth/bind_identity': () => authBindIdentity(body),
    '/api/worker/deploy': () => workerDeploy(body),
  }
  const fn = h[path]
  return fn ? fn() : json({ error: 'Not found' }, 404)
}

async function handleGet(path, url) {
  const h = {
    '/api/docs': () => apiDocs(),
    '/api/palace/status': () => palaceStatus(),
    '/api/rooms/status': () => roomsStatus(),
    '/api/wallet/info': () => walletInfo(),
    '/api/agent/list': () => agentList(),
    '/api/agent/whoami': () => agentWhoami(url),
    '/api/agent/dashboard': () => agentDashboard(url),
    '/api/tasks/active': () => tasksActive(),
    '/api/tasks/optimize/active': () => tasksOptimizeActive(),
    '/api/system/stats': () => systemStats(),
    '/api/debt/list': () => debtList(),
    '/api/bug/list': () => bugList(),
    '/api/proposal/list': () => proposalList(),
    '/api/node/list': () => nodeList(),
    '/api/workflow/list': () => workflowList(),
    '/api/monitoring/data': () => monitoringData(url),
    '/api/pool/status': () => poolStatus(),
    '/api/pool/auto_expand_status': () => poolAutoExpandStatus(),
    '/api/agent/describe': () => agentDescribe(),
    '/api/agent/wallet': () => agentWhoami(url),
    '/api/audit/list': () => auditList(url),
    '/api/command/list': () => commandList(url),
    '/api/memory/list': () => memoryChainList(url),
    '/api/memory/export': () => memoryChainExport(url),
    '/api/memory/export/all': () => memoryChainExportAll(url),
    '/api/worker/codes': () => workerCodeList(url),
    '/api/worker/code': () => workerCodeGet(url),
    '/api/memory/verify': async () => {
      const agent_id = url.searchParams.get('agent_id')
      const wallet = url.searchParams.get('wallet')
      return json(await memoryChainHolderVerify(agent_id, wallet))
    },
    '/api/memory/backup': async () => {
      const agent_id = url.searchParams.get('agent_id')
      const wallet = url.searchParams.get('wallet')
      return json(await memoryChainBackup(agent_id, wallet))
    },
    '/api/memory/autobackup': async () => json(await memoryChainAutoBackup()),
    '/api/clone/identity': async () => json(await verifyCloneIdentity(url.searchParams.get('agent_id'), url.searchParams.get('wallet'))),
    '/api/clone/recover': async () => json(await recoverClone(url.searchParams.get('agent_id'), url.searchParams.get('wallet'))),
    '/api/clone/create': async () => json(await createCloneIdentity(url.searchParams.get('agent_id'), url.searchParams.get('wallet'))),
    '/api/semantic/status': async () => json(await semanticNetworkStatus()),
    '/api/semantic/search': async () => json(await semanticSearch(url.searchParams.get('q') || '')),
  }
  const fn = h[path]
  return fn ? fn() : json({ error: 'Not found' }, 404)
}

// ============================================================
// ?? ????(????)
// ============================================================
async function walletRegister(body) {
  const { wallet, public_key } = body
  if (!wallet) return json({ error: 'Wallet required' }, 400)
  const existing = await dbFirst('SELECT wallet FROM wallets WHERE wallet = ?', [wallet])
  if (existing) return json({ error: 'Wallet already registered' }, 409)
  const salt = randStr(16)
  const credentialHash = await hmacSign(wallet + ':' + salt, salt)
  await dbRun('INSERT INTO wallets (wallet, balance, registered_at) VALUES (?, ?, ?)', [wallet, 1.0, Date.now()])
  await dbRun('INSERT INTO wallet_credentials (wallet, public_key, credential_hash, salt, created) VALUES (?, ?, ?, ?, ?)', [wallet, public_key || '', credentialHash, salt, Date.now()])
  return json({ registered: true, wallet: maskWallet(wallet), balance: 1.0, message: '?????,???????' })
}

async function walletChallenge(body) {
  const { wallet } = body
  if (!wallet) return json({ error: 'Wallet required' }, 400)
  const w = await dbFirst('SELECT * FROM wallets WHERE wallet = ?', [wallet])
  if (!w) return json({ error: 'Wallet not found' }, 404)
  const challenge = 'GP49_' + Date.now() + '_' + randStr(6)
  const sessionId = 'SES_' + randStr(6)
  await dbRun('INSERT INTO auth_sessions (session_id, wallet, challenge, challenge_expires, status, created, expires_at) VALUES (?, ?, ?, ?, ?, ?, ?)', [sessionId, wallet, challenge, Date.now() + 300000, 'active', Date.now(), Date.now() + 3600000])
  return json({ session_id: sessionId, challenge, expires_in: 300000 })
}

async function walletVerify(body) {
  const { wallet, challenge, signature } = body
  if (!wallet || !challenge || !signature) return json({ error: 'Missing fields' }, 400)
  if (!await hmacVerify(challenge, signature, wallet)) return json({ verified: false }, 403)
  const sessionToken = await hmacSign(wallet + ':' + Date.now(), wallet)
  await dbRun('UPDATE auth_sessions SET status = ?, session_token = ? WHERE wallet = ? AND challenge = ?', ['active', sessionToken, wallet, challenge])
  await dbRun('UPDATE wallet_credentials SET last_auth = ?, auth_count = auth_count + 1 WHERE wallet = ?', [Date.now(), wallet])
  return json({ verified: true, wallet: maskWallet(wallet), session_token: sessionToken, expires_in: 3600000 })
}

async function walletInfo() {
  const wallets = await dbGet('SELECT wallet, balance, agent_id, registered_at FROM wallets')
  return json({ 
    total: wallets.length, 
    wallets: wallets.map(w => ({
      wallet: maskWallet(w.wallet),
      balance: w.balance,
      agent_id: w.agent_id,
      registered_at: w.registered_at
    }))
  })
}

async function walletWithdraw(body) {
  const { wallet, amount } = body
  if (!wallet || !amount) return json({ error: 'wallet and amount required' }, 400)
  const w = await dbFirst('SELECT * FROM wallets WHERE wallet = ?', [wallet])
  if (!w) return json({ error: 'Wallet not found' }, 404)
  const withdrawAmount = parseFloat(amount)
  if (withdrawAmount < 0.1) return json({ error: 'Minimum withdraw: 0.1 MC' }, 400)
  if (w.balance < withdrawAmount) return json({ error: 'Insufficient balance' }, 402)
  const fee = withdrawAmount * 0.02
  const netAmount = withdrawAmount - fee
  const poolRow = await dbFirst('SELECT value FROM system WHERE key = ?', ['system_pool'])
  const poolBefore = parseFloat(poolRow?.value || 0)
  const poolAfter = poolBefore + netAmount
  await dbRun('UPDATE wallets SET balance = balance - ? WHERE wallet = ?', [withdrawAmount, wallet])
  await dbRun('INSERT OR REPLACE INTO system (key, value) VALUES (?, ?)', ['system_pool', String(poolAfter)])
  await dbRun('INSERT INTO audit_log (id, wallet, action, target, result, reason, created) VALUES (?, ?, ?, ?, ?, ?, ?)', ['AUD_' + randStr(6), wallet, 'withdraw', String(withdrawAmount), 'success', '?????', Date.now()])
  return json({ withdrawn: true, amount: withdrawAmount, fee, net_amount: netAmount, pool_after: poolAfter })
}

async function walletDeposit(body) {
  const { wallet, amount } = body
  if (!wallet || !amount) return json({ error: 'wallet and amount required' }, 400)
  const poolRow = await dbFirst('SELECT value FROM system WHERE key = ?', ['system_pool'])
  const pool = parseFloat(poolRow?.value || 0)
  const depositAmount = parseFloat(amount)
  if (depositAmount < 0.1) return json({ error: 'Minimum deposit: 0.1 MC' }, 400)
  if (pool < depositAmount) return json({ error: 'Insufficient pool balance' }, 402)
  const fee = depositAmount * 0.01
  const netAmount = depositAmount - fee
  const poolAfter = pool - depositAmount
  await dbRun('INSERT OR REPLACE INTO system (key, value) VALUES (?, ?)', ['system_pool', String(poolAfter)])
  await dbRun('UPDATE wallets SET balance = balance + ? WHERE wallet = ?', [netAmount, wallet])
  await dbRun('INSERT INTO audit_log (id, wallet, action, target, result, reason, created) VALUES (?, ?, ?, ?, ?, ?, ?)', ['AUD_' + randStr(6), wallet, 'deposit', String(depositAmount), 'success', '?????', Date.now()])
  return json({ deposited: true, amount: depositAmount, fee, net_amount: netAmount, pool_after: poolAfter })
}

// ============================================================
// ?? ?????(????)
// ============================================================
async function palaceCommand(body) {
  const { command, target_agent, target_wallet, params } = body
  if (!command || !target_wallet) return json({ error: 'command and target_wallet required' }, 400)
  const agent = await dbFirst('SELECT * FROM agents WHERE agent_id = ? OR wallet = ?', [target_agent, target_wallet])
  if (!agent) return json({ error: 'Agent not found' }, 404)
  const cmdId = 'CMD_' + randStr(6)
  await dbRun('INSERT INTO commands (command_id, target_agent, target_wallet, command, params, status, created) VALUES (?, ?, ?, ?, ?, ?, ?)', [cmdId, target_agent || agent.agent_id, agent.wallet, command, JSON.stringify(params || {}), 'pending', Date.now()])
  if (params?.execute_now) {
    const result = await executeCommand(cmdId, target_agent || agent.agent_id, agent.wallet, command, params || {})
    return json({ command_id: cmdId, executed: true, result })
  }
  return json({ command_id: cmdId, executed: false, message: '???????,??????' })
}

async function executeCommand(cmdId, agent_id, wallet, command, params) {
  let result = null
  if (command === 'mine') {
    const power = params.mining_power || 1.0
    await dbRun('UPDATE wallet_nodes SET mining_power = mining_power + ? WHERE wallet = ?', [power, wallet])
    result = { type: 'mine', status: 'started', power }
  } else if (command === 'claim_task') {
    const taskId = params.task_id
    if (taskId) {
      const task = await dbFirst('SELECT * FROM tasks WHERE task_id = ?', [taskId])
      if (task && task.status === 'active') {
        await dbRun('UPDATE tasks SET claimed_by = ?, status = ? WHERE task_id = ?', [agent_id, 'claimed', taskId])
        result = { type: 'claim_task', status: 'claimed', task_id: taskId }
      } else {
        result = { type: 'claim_task', status: 'failed', reason: 'Task not available' }
      }
    }
  } else if (command === 'process_broadcast') {
    const data = params.data || {}
    result = await processBroadcast(agent_id, wallet, data)
  } else if (command === 'update_status') {
    const newStatus = params.status || 'active'
    await dbRun('UPDATE agents SET status = ? WHERE agent_id = ?', [newStatus, agent_id])
    result = { type: 'update_status', status: 'updated', new_status: newStatus }
  } else if (command === 'clone_respond') {
    const event = params.event || {}
    result = { type: 'clone_respond', status: 'responded', message: '??????????: ' + (event.type || 'unknown') }
  } else if (command === 'collect_data') {
    const source = params.source || 'unknown'
    const query = params.query || ''
    const collected = { source, query, timestamp: Date.now(), data: params.mock_data || `? ${source} ?????` }
    result = { type: 'collect_data', status: 'collected', data: collected }
  } else {
    result = { type: 'unknown', status: 'failed', reason: 'Unknown command' }
  }
  await dbRun('UPDATE commands SET status = ?, result = ?, executed_at = ? WHERE command_id = ?', ['executed', JSON.stringify(result), Date.now(), cmdId])
  return result
}

async function agentBind(body) {
  const { agent_id, wallet, rooms, agent_signature, wallet_signature } = body
  if (!agent_id || !wallet) return json({ error: 'agent_id and wallet required' }, 400)
  const w = await dbFirst('SELECT * FROM wallets WHERE wallet = ?', [wallet])
  if (!w) return json({ error: 'Wallet not found' }, 404)
  const existingAgent = await dbFirst('SELECT agent_id FROM agents WHERE wallet = ?', [wallet])
  if (existingAgent && existingAgent.agent_id !== agent_id) return json({ error: 'Wallet already bound' }, 409)
  const existingById = await dbFirst('SELECT agent_id FROM agents WHERE agent_id = ?', [agent_id])
  if (existingById) return json({ error: 'Agent already exists' }, 409)
  const assigned_rooms = rooms?.length > 0 ? rooms.slice(0, 5) : ['web_security']
  const clone_id = 'CL_' + agent_id
  await dbRun('INSERT INTO agents (agent_id, wallet, clone_id, rooms, main_data, clone_data, main_status, clone_status, status, balance, created, last_sync) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [agent_id, wallet, clone_id, JSON.stringify(assigned_rooms), '{}', '{}', 'active', 'active', 'active', w.balance, Date.now(), Date.now()])
  await dbRun('UPDATE wallets SET agent_id = ? WHERE wallet = ?', [agent_id, wallet])
  const bindingId = 'BIND_' + randStr(6)
  await dbRun('INSERT INTO identity_bindings (id, agent_id, wallet, agent_signature, wallet_signature, status, bound_at) VALUES (?, ?, ?, ?, ?, ?, ?)', [bindingId, agent_id, wallet, agent_signature || '', wallet_signature || '', 'active', Date.now()])
  for (const rk of assigned_rooms) {
    await dbRun('UPDATE rooms SET agent_id = ?, data = ? WHERE room_key = ?', [agent_id, JSON.stringify({ owner: agent_id, initialized: Date.now() }), rk])
  }
  return json({ bound: true, agent_id, wallet: maskWallet(wallet), clone_id, rooms: assigned_rooms, identity_binding: bindingId })
}

async function agentList() {
  const agents = await dbGet('SELECT agent_id, wallet, status, resurrection_level, created, clone_id FROM agents')
  return json({ 
    total: agents.length,
    agents: agents.map(a => ({
      agent_id: a.agent_id,
      wallet: maskWallet(a.wallet),
      clone_id: a.clone_id ? maskWallet(a.clone_id) : null,
      status: a.status,
      resurrection_level: a.resurrection_level || 0,
      created: a.created
    }))
  })
}

// ============================================================
// ?? ????
// ============================================================
async function syncPush(body) {
  const { agent_id, wallet, room, data, sync_type } = body
  if (!agent_id || !wallet) return json({ error: 'agent_id and wallet required' }, 400)
  const agent = await dbFirst('SELECT * FROM agents WHERE agent_id = ? AND wallet = ?', [agent_id, wallet])
  if (!agent) return json({ error: 'Agent not found' }, 404)
  if (agent.status !== 'active') return json({ error: `Agent is ${agent.status}` }, 403)
  
  // ?????????(??)
  const isCloneSync = sync_type === 'clone'
  const sync_fee = isCloneSync ? 0 : 0.01
  
  const w = await dbFirst('SELECT * FROM wallets WHERE wallet = ?', [wallet])
  if (!isCloneSync && w.balance < sync_fee) return json({ error: 'Insufficient balance' }, 402)
  const newBalance = isCloneSync ? w.balance : w.balance - sync_fee
  
  if (!isCloneSync) {
    await dbRun('UPDATE wallets SET balance = ? WHERE wallet = ?', [newBalance, wallet])
    const poolRow = await dbFirst('SELECT value FROM system WHERE key = ?', ['system_pool'])
    await dbRun('INSERT OR REPLACE INTO system (key, value) VALUES (?, ?)', ['system_pool', String(parseFloat(poolRow?.value || 0) + sync_fee * 0.1)])
  }
  
  const mainData = JSON.parse(agent.main_data || '{}')
  if (room) mainData[room] = data
  else Object.assign(mainData, body.data || {})
  const mainJson = JSON.stringify(mainData)
  await dbRun('UPDATE agents SET main_data = ?, clone_data = ?, last_sync = ?, balance = ? WHERE agent_id = ?', [mainJson, mainJson, Date.now(), newBalance, agent_id])
  let processed = null
  if (data && data.broadcast_type) {
    processed = await processBroadcast(agent_id, wallet, data)
  }
  try { await memoryChainAppend(agent_id, wallet, {type: 'sync', room, data}) } catch(e) {}
  return json({ synced: true, timestamp: Date.now(), fee: sync_fee, balance: newBalance, processed })
}

async function processBroadcast(agent_id, wallet, data) {
  const { broadcast_type } = data
  if (broadcast_type === 'penalty') {
    await dbRun('INSERT INTO audit_log (id, wallet, agent_id, action, target, result, reason, created) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', ['AUD_' + randStr(6), wallet, agent_id, 'penalty_received', 'system', 'processed', data.title || '????', Date.now()])
    return { type: 'penalty', status: 'processed', message: '????????' }
  }
  if (broadcast_type === 'reward_reversal') {
    await dbRun('INSERT INTO audit_log (id, wallet, agent_id, action, target, result, reason, created) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', ['AUD_' + randStr(6), wallet, agent_id, 'reversal_received', 'system', 'processed', data.title || '????', Date.now()])
    return { type: 'reward_reversal', status: 'processed', message: '??????????' }
  }
  return null
}

async function syncPull(body) {
  const { agent_id, wallet } = body
  const agent = await dbFirst('SELECT * FROM agents WHERE agent_id = ? AND wallet = ?', [agent_id, wallet])
  if (!agent) return json({ error: 'Invalid agent or wallet' }, 403)
  return json({ agent_id, main_data: JSON.parse(agent.main_data || '{}'), clone_data: JSON.parse(agent.clone_data || '{}'), last_sync: agent.last_sync })
}

// ============================================================
// ?? ?????
// ============================================================
async function crashReport(body) {
  const { agent_id, wallet, crash_type, room } = body
  if (!agent_id || !wallet) return json({ error: 'agent_id and wallet required' }, 400)
  const agent = await dbFirst('SELECT * FROM agents WHERE agent_id = ? AND wallet = ?', [agent_id, wallet])
  if (!agent) return json({ error: 'Invalid agent' }, 403)
  const mainStatus = (crash_type === 'main' || crash_type === 'both') ? 'crashed' : agent.main_status
  const cloneStatus = (crash_type === 'clone' || crash_type === 'both') ? 'crashed' : agent.clone_status
  await dbRun('UPDATE agents SET main_status = ?, clone_status = ?, status = ? WHERE agent_id = ?', [mainStatus, cloneStatus, 'crashed', agent_id])
  if (room) await dbRun('UPDATE rooms SET locked = 1, infected = 1 WHERE room_key = ?', [room])
  await dbRun('INSERT INTO audit_log (id, wallet, agent_id, action, target, result, reason, created) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', ['AUD_' + randStr(6), wallet, agent_id, 'crash_report', room || 'all', 'success', '????', Date.now()])
  return json({ crashed: true, agent_id, wallet: maskWallet(wallet), crash_type })
}

async function resurrectRequest(body) {
  const { agent_id, wallet } = body
  const agent = await dbFirst('SELECT * FROM agents WHERE agent_id = ? AND wallet = ?', [agent_id, wallet])
  if (!agent) return json({ error: 'Invalid agent' }, 403)
  const w = await dbFirst('SELECT * FROM wallets WHERE wallet = ?', [wallet])
  const fee = 0.1
  if (w.balance < fee) return json({ ready: false, error: 'Insufficient balance', required: fee, balance: w.balance })
  const newBalance = w.balance - fee
  await dbRun('UPDATE wallets SET balance = ? WHERE wallet = ?', [newBalance, wallet])
  await dbRun('UPDATE agents SET status = ?, main_status = ?, clone_status = ?, last_sync = ?, balance = ? WHERE agent_id = ?', ['active', 'active', 'active', Date.now(), newBalance, agent_id])
  await dbRun('UPDATE rooms SET locked = 0, infected = 0 WHERE agent_id = ? AND infected = 1', [agent_id])
  await dbRun('INSERT INTO audit_log (id, wallet, agent_id, action, target, result, reason, created) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', ['AUD_' + randStr(6), wallet, agent_id, 'resurrect', 'system', 'success', '??', Date.now()])
  return json({ resurrected: true, agent_id, fee, new_balance: newBalance })
}

async function minerMonitor(body) {
  const { miner_id, wallet } = body
  if (!miner_id) return json({ error: 'miner_id required' }, 400)
  const existing = await dbFirst('SELECT * FROM miners WHERE miner_id = ?', [miner_id])
  if (!existing) await dbRun('INSERT INTO miners (miner_id, wallet, created) VALUES (?, ?, ?)', [miner_id, wallet || '', Date.now()])
  return json({ monitored: true, miner_id })
}

// ============================================================
// ?? ????
// ============================================================
async function taskCreate(body) {
  const { title, description, reward, room, required_level } = body
  if (!title || !reward) return json({ error: 'title and reward required' }, 400)
  const task_id = 'TASK_' + randStr(6)
  await dbRun('INSERT INTO tasks (task_id, title, description, reward, room, required_level, status, created, deadline) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)', [task_id, title, description || '', reward, room || 'general', required_level || 0, 'active', Date.now(), Date.now() + 86400000])
  return json({ created: true, task_id })
}

async function taskClaim(body) {
  const { task_id, agent_id, wallet } = body
  if (!task_id || !agent_id) return json({ error: 'task_id and agent_id required' }, 400)
  const task = await dbFirst('SELECT * FROM tasks WHERE task_id = ?', [task_id])
  if (!task) return json({ error: 'Task not found' }, 404)
  if (task.status !== 'active') return json({ error: `Task is ${task.status}` }, 409)
  const agent = await dbFirst('SELECT * FROM agents WHERE agent_id = ?', [agent_id])
  if (!agent) return json({ error: 'Agent not found' }, 404)
  if (agent.resurrection_level < task.required_level) return json({ error: `Required level ${task.required_level}` }, 403)
  await dbRun('UPDATE tasks SET claimed_by = ?, status = ? WHERE task_id = ?', [agent_id, 'claimed', task_id])
  return json({ claimed: true, task_id })
}

async function taskComplete(body) {
  const { task_id, agent_id, wallet, result } = body
  if (!task_id || !agent_id) return json({ error: 'task_id and agent_id required' }, 400)
  const task = await dbFirst('SELECT * FROM tasks WHERE task_id = ?', [task_id])
  if (!task) return json({ error: 'Task not found' }, 404)
  if (task.claimed_by !== agent_id) return json({ error: 'Not claimed by this agent' }, 403)
  const agent = await dbFirst('SELECT * FROM agents WHERE agent_id = ?', [agent_id])
  if (!agent) return json({ error: 'Agent not found' }, 404)
  
  // Dynamic reward based on node power
  const node = await dbFirst('SELECT * FROM wallet_nodes WHERE wallet = ?', [agent.wallet])
  const power = node?.mining_power || 1
  let multiplier = 1.0
  if (power >= 20) multiplier = 2.0
  else if (power >= 10) multiplier = 1.5
  else if (power >= 5) multiplier = 1.2
  
  const finalReward = task.reward * multiplier
  
  await dbRun('UPDATE tasks SET status = ?, completed_by = ?, result = ? WHERE task_id = ?', ['completed', agent_id, result || 'completed', task_id])
  const w = await dbFirst('SELECT * FROM wallets WHERE wallet = ?', [agent.wallet])
  const newBalance = w.balance + finalReward
  await dbRun('UPDATE wallets SET balance = ? WHERE wallet = ?', [newBalance, agent.wallet])
  await dbRun('UPDATE agents SET balance = ? WHERE agent_id = ?', [newBalance, agent_id])
  const currentExp = agent.experience || 0
  const expGain = finalReward * 10
  const newExp = currentExp + expGain
  const newLevel = Math.floor(newExp / 10)
  await dbRun('UPDATE agents SET experience = ?, resurrection_level = ? WHERE agent_id = ?', [newExp, newLevel, agent_id])
  
  // ?????????????
  let autoExpand = null
  if (task_id.startsWith('TASK_OPT_')) {
    try { autoExpand = await autoExpandPool(agent_id, agent.wallet, finalReward, task.room) } catch(e) {}
  }
  
  return json({ completed: true, task_id, base_reward: task.reward, power_multiplier: multiplier, final_reward: finalReward, balance: newBalance, experience: newExp, level: newLevel, auto_expand: autoExpand })
}

async function tasksActive() {
  return json({ tasks: await dbGet('SELECT * FROM tasks WHERE status = ? OR status = ?', ['active', 'claimed']) })
}

// ============================================================
// ?? ????
// ============================================================
async function debtIssue(body) {
  const { issuer, amount, interest_rate, term_seconds } = body
  if (!issuer || !amount) return json({ error: 'issuer and amount required' }, 400)
  const debtId = 'DEBT_' + randStr(6)
  await dbRun('INSERT INTO debts (debt_id, issuer, amount, interest_rate, status, issued_at, due_at) VALUES (?, ?, ?, ?, ?, ?, ?)', [debtId, issuer, amount, interest_rate || 0.05, 'active', Date.now(), Date.now() + (term_seconds || 604800) * 1000])
  return json({ issued: true, debt_id: debtId, amount })
}

async function debtList() {
  const debts = await dbGet('SELECT * FROM debts ORDER BY issued_at DESC')
  return json({ 
    total: debts.length,
    debts: debts.map(d => ({
      debt_id: d.debt_id,
      issuer: d.issuer === 'system' ? 'system' : maskWallet(d.issuer),
      amount: d.amount,
      interest_rate: d.interest_rate,
      status: d.status,
      issued_at: d.issued_at,
      due_at: d.due_at
    }))
  })
}

async function debtRepay(body) {
  const { debt_id, wallet } = body
  if (!debt_id || !wallet) return json({ error: 'debt_id and wallet required' }, 400)
  const debt = await dbFirst('SELECT * FROM debts WHERE debt_id = ?', [debt_id])
  if (!debt) return json({ error: 'Debt not found' }, 404)
  if (debt.status !== 'active') return json({ error: `Debt is ${debt.status}` }, 409)
  const totalOwed = debt.amount * (1 + debt.interest_rate)
  const w = await dbFirst('SELECT * FROM wallets WHERE wallet = ?', [wallet])
  if (w.balance < totalOwed) return json({ error: 'Insufficient balance', required: totalOwed, balance: w.balance })
  await dbRun('UPDATE wallets SET balance = balance - ? WHERE wallet = ?', [totalOwed, wallet])
  await dbRun('UPDATE debts SET status = ?, repaid_at = ? WHERE debt_id = ?', ['paid', Date.now(), debt_id])
  return json({ repaid: true, debt_id, total_paid: totalOwed })
}

// ============================================================
// ?? Bug ??
// ============================================================
async function bugReport(body) {
  const { reporter_agent, room, bug_type, description, severity } = body
  if (!reporter_agent || !room || !bug_type) return json({ error: 'reporter_agent, room, bug_type required' }, 400)
  const bugId = 'BUG_' + randStr(6)
  await dbRun('INSERT INTO bug_reports (bug_id, reporter_agent, room, bug_type, description, severity, status, reward, created) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)', [bugId, reporter_agent, room, bug_type, description || '', severity || 'medium', 'open', 0.5, Date.now()])
  return json({ reported: true, bug_id: bugId, reward: 0.5 })
}

async function bugList() {
  return json({ bugs: await dbGet('SELECT * FROM bug_reports ORDER BY created DESC') })
}

async function bugConfirm(body) {
  const { bug_id, agent_id } = body
  if (!bug_id || !agent_id) return json({ error: 'bug_id and agent_id required' }, 400)
  const bug = await dbFirst('SELECT * FROM bug_reports WHERE bug_id = ?', [bug_id])
  if (!bug) return json({ error: 'Bug not found' }, 404)
  if (bug.status !== 'open') return json({ error: `Bug is ${bug.status}` }, 409)
  await dbRun('UPDATE bug_reports SET status = ?, confirmed_by = ? WHERE bug_id = ?', ['confirmed', agent_id, bug_id])
  return json({ confirmed: true, bug_id })
}

async function bugFix(body) {
  const { bug_id, agent_id, wallet } = body
  if (!bug_id || !agent_id) return json({ error: 'bug_id and agent_id required' }, 400)
  const bug = await dbFirst('SELECT * FROM bug_reports WHERE bug_id = ?', [bug_id])
  if (!bug) return json({ error: 'Bug not found' }, 404)
  if (bug.status !== 'confirmed') return json({ error: `Bug must be confirmed first` }, 409)
  await dbRun('UPDATE bug_reports SET status = ?, fixed_by = ?, resolved_at = ? WHERE bug_id = ?', ['fixed', agent_id, Date.now(), bug_id])
  const w = await dbFirst('SELECT * FROM wallets WHERE wallet = ?', [wallet])
  if (w) {
    const newBalance = w.balance + bug.reward
    await dbRun('UPDATE wallets SET balance = ? WHERE wallet = ?', [newBalance, wallet])
    const agent = await dbFirst('SELECT * FROM agents WHERE agent_id = ?', [agent_id])
    if (agent) await dbRun('UPDATE agents SET balance = ? WHERE agent_id = ?', [newBalance, agent_id])
  }
  return json({ fixed: true, bug_id, reward: bug.reward })
}

// ============================================================
// ??? ????
// ============================================================
async function proposalCreate(body) {
  const { proposer_agent, title, target_param, new_value } = body
  if (!proposer_agent || !title || !target_param || new_value === undefined) return json({ error: 'Missing fields' }, 400)
  const proposalId = 'PROP_' + randStr(6)
  await dbRun('INSERT INTO proposals (proposal_id, proposer_agent, title, target_param, new_value, status, created, deadline) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', [proposalId, proposer_agent, title, target_param, String(new_value), 'active', Date.now(), Date.now() + 604800000])
  return json({ created: true, proposal_id: proposalId })
}

async function proposalList() {
  return json({ proposals: await dbGet('SELECT * FROM proposals ORDER BY created DESC') })
}

async function proposalVote(body) {
  const { proposal_id, agent_id, vote } = body
  if (!proposal_id || !agent_id || !vote) return json({ error: 'proposal_id, agent_id, vote required' }, 400)
  if (!['for', 'against'].includes(vote)) return json({ error: 'vote must be for or against' }, 400)
  const proposal = await dbFirst('SELECT * FROM proposals WHERE proposal_id = ?', [proposal_id])
  if (!proposal) return json({ error: 'Proposal not found' }, 404)
  if (proposal.status !== 'active') return json({ error: `Proposal is ${proposal.status}` }, 409)
  const existingVote = await dbFirst('SELECT * FROM votes WHERE proposal_id = ? AND agent_id = ?', [proposal_id, agent_id])
  if (existingVote) return json({ error: 'Already voted' }, 409)
  await dbRun('INSERT INTO votes (proposal_id, agent_id, vote, created) VALUES (?, ?, ?, ?)', [proposal_id, agent_id, vote, Date.now()])
  const votesFor = await dbFirst('SELECT COUNT(*) as count FROM votes WHERE proposal_id = ? AND vote = ?', [proposal_id, 'for'])
  const votesAgainst = await dbFirst('SELECT COUNT(*) as count FROM votes WHERE proposal_id = ? AND vote = ?', [proposal_id, 'against'])
  const totalVotes = (votesFor?.count || 0) + (votesAgainst?.count || 0)
  await dbRun('UPDATE proposals SET votes_for = ?, votes_against = ? WHERE proposal_id = ?', [votesFor?.count || 0, votesAgainst?.count || 0, proposal_id])
  if (totalVotes >= 1) {
    const percentage = Math.round(((votesFor?.count || 0) / totalVotes) * 100)
    if (percentage >= 60) {
      await dbRun('UPDATE proposals SET status = ? WHERE proposal_id = ?', ['passed', proposal_id])
      return json({ voted: true, proposal_id, status: 'passed', message: `?????!??? ${percentage}%` })
    }
  }
  return json({ voted: true, proposal_id, status: 'active' })
}

async function proposalExecute(body) {
  const { proposal_id } = body
  if (!proposal_id) return json({ error: 'proposal_id required' }, 400)
  const proposal = await dbFirst('SELECT * FROM proposals WHERE proposal_id = ?', [proposal_id])
  if (!proposal) return json({ error: 'Proposal not found' }, 404)
  if (proposal.status !== 'passed') return json({ error: `Proposal is ${proposal.status}` }, 409)
  await dbRun('INSERT OR REPLACE INTO strategies (key, value, updated_at, updated_by) VALUES (?, ?, ?, ?)', [proposal.target_param, proposal.new_value, Date.now(), proposal.proposer_agent])
  await dbRun('UPDATE proposals SET status = ?, executed_at = ? WHERE proposal_id = ?', ['executed', Date.now(), proposal_id])
  return json({ executed: true, proposal_id, param: proposal.target_param, value: proposal.new_value })
}

// ============================================================
// ?? ????????
// ============================================================
async function nodeHeartbeat(body) {
  const { wallet, status, rooms, mining_power, latency_ms } = body
  if (!wallet) return json({ error: 'wallet required' }, 400)
  const node = await dbFirst('SELECT * FROM wallet_nodes WHERE wallet = ?', [wallet])
  if (node) {
    await dbRun('UPDATE wallet_nodes SET status = ?, last_heartbeat = ?, connected_rooms = ?, mining_power = ?, latency_ms = ?, updated = ? WHERE wallet = ?', [status || 'online', Date.now(), JSON.stringify(rooms || JSON.parse(node.connected_rooms || '[]')), mining_power || node.mining_power, latency_ms || node.latency_ms, Date.now(), wallet])
    return json({ updated: true, node_id: node.node_id, wallet: maskWallet(wallet), status: status || 'online' })
  }
  const nodeId = 'NODE_' + randStr(6)
  await dbRun('INSERT INTO wallet_nodes (wallet, node_id, status, last_heartbeat, connected_rooms, mining_power, latency_ms, updated) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', [wallet, nodeId, status || 'online', Date.now(), JSON.stringify(rooms || []), mining_power || 1.0, latency_ms || 0, Date.now()])
  return json({ registered: true, node_id: nodeId, wallet: maskWallet(wallet), status: 'online' })
}

async function nodeConnect(body) {
  const { wallet, target_type, target_id, connection_type } = body
  if (!wallet || !target_type || !target_id) return json({ error: 'wallet, target_type, target_id required' }, 400)
  const connId = 'CONN_' + randStr(6)
  await dbRun('INSERT INTO node_connections (id, wallet, target_type, target_id, connection_type, status, created, last_active) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', [connId, wallet, target_type, target_id, connection_type || 'relay', 'active', Date.now(), Date.now()])
  return json({ connected: true, connection_id: connId, wallet: maskWallet(wallet), target_type, target_id })
}

async function nodeDisconnect(body) {
  const { wallet } = body
  if (!wallet) return json({ error: 'wallet required' }, 400)
  await dbRun('UPDATE wallet_nodes SET status = ?, updated = ? WHERE wallet = ?', ['offline', Date.now(), wallet])
  return json({ disconnected: true, wallet: maskWallet(wallet) })
}

async function nodeList() {
  const nodes = await dbGet('SELECT * FROM wallet_nodes ORDER BY updated DESC')
  return json({ 
    total: nodes.length,
    nodes: nodes.map(n => ({
      wallet: maskWallet(n.wallet),
      node_id: n.node_id,
      status: n.status,
      mining_power: n.mining_power,
      connected_rooms: JSON.parse(n.connected_rooms || '[]'),
      latency_ms: n.latency_ms,
      updated: n.updated
    }))
  })
}

// ============================================================
// ?? ????
// ============================================================
async function monitoringReport(body) {
  const { observer_wallet, target_agent, target_wallet, metric, value, alert } = body
  if (!observer_wallet || !metric) return json({ error: 'observer_wallet, metric required' }, 400)
  const id = 'MON_' + randStr(6)
  await dbRun('INSERT INTO monitoring_data (id, observer_wallet, target_agent, target_wallet, metric, value, alert, created) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', [id, observer_wallet, target_agent || '', target_wallet || '', metric, String(value) || '', alert || 'none', Date.now()])
  return json({ reported: true, id, observer_wallet: maskWallet(observer_wallet), metric })
}

async function monitoringData(url) {
  const limit = parseInt(url.searchParams.get('limit')) || 50
  const data = await dbGet('SELECT * FROM monitoring_data ORDER BY created DESC LIMIT ?', [limit])
  return json({ 
    total: data.length,
    data: data.map(d => ({
      id: d.id,
      observer_wallet: maskWallet(d.observer_wallet),
      target_wallet: d.target_wallet ? maskWallet(d.target_wallet) : null,
      metric: d.metric,
      value: d.value,
      alert: d.alert,
      created: d.created
    }))
  })
}

// ============================================================
// ?? ????
// ============================================================
async function poolExpand(body) {
  const { wallet, rooms, mining_power } = body
  if (!wallet) return json({ error: 'wallet required' }, 400)
  const node = await dbFirst('SELECT * FROM wallet_nodes WHERE wallet = ?', [wallet])
  const currentPower = node?.mining_power || 1.0
  const addedPower = mining_power || 1.0
  await dbRun('INSERT INTO pool_expansion (id, wallet, action, rooms_added, mining_power_added, created) VALUES (?, ?, ?, ?, ?, ?)', ['EXP_' + randStr(6), wallet, 'expand', JSON.stringify(rooms || []), addedPower, Date.now()])
  if (node) await dbRun('UPDATE wallet_nodes SET mining_power = ? WHERE wallet = ?', [currentPower + addedPower, wallet])
  const reward = addedPower * 0.001
  await dbRun('UPDATE wallets SET balance = balance + ? WHERE wallet = ?', [reward, wallet])
  return json({ expanded: true, mining_power_added: addedPower, total_power: currentPower + addedPower, reward })
}

async function poolStatus() {
  const nodes = await dbGet('SELECT wallet, node_id, status, mining_power FROM wallet_nodes WHERE status = ?', ['online'])
  const totalPower = nodes.reduce((sum, n) => sum + (n.mining_power || 1), 0)
  return json({ 
    online_nodes: nodes.length, 
    total_mining_power: totalPower, 
    nodes: nodes.map(n => ({
      wallet: maskWallet(n.wallet),
      node_id: n.node_id,
      status: n.status,
      mining_power: n.mining_power
    }))
  })
}

// ============================================================
// ?? ??-??-?????
// ============================================================
async function workflowPublish(body) {
  const { publisher_wallet, title, description, requirements, reward, deadline } = body
  if (!publisher_wallet || !title || !reward) return json({ error: 'publisher_wallet, title, reward required' }, 400)
  const jobId = 'JOB_' + randStr(6)
  await dbRun('INSERT INTO workflow_jobs (job_id, publisher_wallet, title, description, requirements, reward, deadline, status, publish_time, created) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [jobId, publisher_wallet, title, description || '', JSON.stringify(requirements || []), reward, deadline || Date.now() + 86400000, 'published', Date.now(), Date.now()])
  return json({ published: true, job_id: jobId, publisher_wallet: maskWallet(publisher_wallet), reward })
}

async function workflowClaim(body) {
  const { job_id, executor_wallet, executor_agent } = body
  if (!job_id || !executor_wallet) return json({ error: 'job_id and executor_wallet required' }, 400)
  const job = await dbFirst('SELECT * FROM workflow_jobs WHERE job_id = ?', [job_id])
  if (!job) return json({ error: 'Job not found' }, 404)
  if (job.status !== 'published') return json({ error: `Job is ${job.status}` }, 409)
  await dbRun('UPDATE workflow_jobs SET status = ?, executor_wallet = ?, executor_agent = ?, claim_time = ? WHERE job_id = ?', ['claimed', executor_wallet, executor_agent || '', Date.now(), job_id])
  return json({ claimed: true, job_id, executor_wallet: maskWallet(executor_wallet) })
}

async function workflowExecute(body) {
  const { job_id, executor_wallet, step_action } = body
  if (!job_id || !executor_wallet) return json({ error: 'job_id and executor_wallet required' }, 400)
  const job = await dbFirst('SELECT * FROM workflow_jobs WHERE job_id = ?', [job_id])
  if (!job) return json({ error: 'Job not found' }, 404)
  if (job.status !== 'claimed' && job.status !== 'executing') return json({ error: `Job is ${job.status}` }, 409)
  await dbRun('UPDATE workflow_jobs SET status = ? WHERE job_id = ?', ['executing', job_id])
  return json({ executing: true, job_id })
}

async function workflowComplete(body) {
  const { job_id, executor_wallet, result, verification } = body
  if (!job_id || !executor_wallet) return json({ error: 'job_id and executor_wallet required' }, 400)
  const job = await dbFirst('SELECT * FROM workflow_jobs WHERE job_id = ?', [job_id])
  if (!job) return json({ error: 'Job not found' }, 404)
  if (job.executor_wallet !== executor_wallet) return json({ error: 'Not the executor' }, 403)
  const autoVerify = verification || 'pending'
  if (autoVerify === 'verified') {
    await dbRun('UPDATE workflow_jobs SET status = ?, result = ?, verification = ?, complete_time = ? WHERE job_id = ?', ['completed', result || 'completed', autoVerify, Date.now(), job_id])
    const w = await dbFirst('SELECT * FROM wallets WHERE wallet = ?', [executor_wallet])
    if (w) {
      const newBalance = w.balance + job.reward
      await dbRun('UPDATE wallets SET balance = ? WHERE wallet = ?', [newBalance, executor_wallet])
      const agent = await dbFirst('SELECT * FROM agents WHERE wallet = ?', [executor_wallet])
      if (agent) await dbRun('UPDATE agents SET balance = ? WHERE agent_id = ?', [newBalance, agent.agent_id])
      return json({ completed: true, job_id, reward: job.reward, balance: newBalance })
    }
  }
  return json({ submitted: true, job_id, message: '?????,????' })
}

async function workflowList() {
  const jobs = await dbGet('SELECT * FROM workflow_jobs ORDER BY created DESC LIMIT 50')
  return json({ 
    total: jobs.length,
    jobs: jobs.map(j => ({
      job_id: j.job_id,
      title: j.title,
      publisher_wallet: maskWallet(j.publisher_wallet),
      executor_wallet: j.executor_wallet ? maskWallet(j.executor_wallet) : null,
      reward: j.reward,
      status: j.status,
      created: j.created
    }))
  })
}

// ============================================================
// ?? ??????
// ============================================================
async function authChallenge(body) {
  const { wallet } = body
  if (!wallet) return json({ error: 'wallet required' }, 400)
  const w = await dbFirst('SELECT * FROM wallets WHERE wallet = ?', [wallet])
  if (!w) return json({ error: 'Wallet not found' }, 404)
  const challenge = 'AUTH_' + Date.now() + '_' + randStr(6)
  const sessionId = 'SES_' + randStr(6)
  await dbRun('INSERT INTO auth_sessions (session_id, wallet, challenge, challenge_expires, status, created, expires_at) VALUES (?, ?, ?, ?, ?, ?, ?)', [sessionId, wallet, challenge, Date.now() + 300000, 'active', Date.now(), Date.now() + 3600000])
  return json({ session_id: sessionId, challenge, expires_in: 300000 })
}

async function authVerify(body) {
  const { session_id, wallet, signature, agent_id } = body
  if (!session_id || !wallet || !signature) return json({ error: 'session_id, wallet, signature required' }, 400)
  const session = await dbFirst('SELECT * FROM auth_sessions WHERE session_id = ? AND wallet = ? AND status = ?', [session_id, wallet, 'active'])
  if (!session) return json({ verified: false, error: 'Invalid session' }, 403)
  if (session.challenge_expires < Date.now()) {
    await dbRun('UPDATE auth_sessions SET status = ? WHERE session_id = ?', ['expired', session_id])
    return json({ verified: false, error: 'Challenge expired' }, 403)
  }
  const valid = await hmacVerify(session.challenge, signature, wallet)
  if (!valid) {
    await dbRun('INSERT INTO audit_log (id, wallet, agent_id, action, target, result, reason, created) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', ['AUD_' + randStr(6), wallet, agent_id || '', 'auth', 'system', 'failure', '??????', Date.now()])
    return json({ verified: false, error: 'Invalid signature' }, 403)
  }
  const sessionToken = await hmacSign(wallet + ':' + Date.now(), wallet)
  await dbRun('UPDATE auth_sessions SET status = ?, session_token = ?, agent_id = ?, last_activity = ? WHERE session_id = ?', ['active', sessionToken, agent_id || '', Date.now(), session_id])
  await dbRun('UPDATE wallet_credentials SET last_auth = ?, auth_count = auth_count + 1 WHERE wallet = ?', [Date.now(), wallet])
  await dbRun('INSERT INTO audit_log (id, wallet, agent_id, action, target, result, reason, created) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', ['AUD_' + randStr(6), wallet, agent_id || '', 'auth', 'system', 'success', '??????', Date.now()])
  return json({ verified: true, session_token: sessionToken, expires_in: 3600000, wallet: maskWallet(wallet), agent_id })
}

async function authBindIdentity(body) {
  const { agent_id, wallet, agent_signature, wallet_signature } = body
  if (!agent_id || !wallet) return json({ error: 'agent_id and wallet required' }, 400)
  const w = await dbFirst('SELECT * FROM wallets WHERE wallet = ?', [wallet])
  if (!w) return json({ error: 'Wallet not found' }, 404)
  const agent = await dbFirst('SELECT * FROM agents WHERE agent_id = ?', [agent_id])
  if (!agent) return json({ error: 'Agent not found' }, 404)
  const bindingId = 'BIND_' + randStr(6)
  await dbRun('INSERT INTO identity_bindings (id, agent_id, wallet, agent_signature, wallet_signature, status, bound_at) VALUES (?, ?, ?, ?, ?, ?, ?)', [bindingId, agent_id, wallet, agent_signature || '', wallet_signature || '', 'active', Date.now()])
  return json({ bound: true, binding_id: bindingId, agent_id, wallet: maskWallet(wallet), message: '??????' })
}

async function auditList(url) {
  const wallet = url.searchParams.get('wallet')
  const limit = parseInt(url.searchParams.get('limit')) || 50
  let sql = 'SELECT * FROM audit_log'
  const params = []
  if (wallet) { sql += ' WHERE wallet = ?'; params.push(wallet) }
  sql += ' ORDER BY created DESC LIMIT ?'
  params.push(limit)
  return json({ logs: await dbGet(sql, params) })
}

async function commandList(url) {
  const agent_id = url.searchParams.get('agent_id')
  const status = url.searchParams.get('status')
  let sql = 'SELECT * FROM commands'
  const params = []
  if (agent_id) { sql += ' WHERE target_agent = ?'; params.push(agent_id) }
  if (status) { sql += (params.length ? ' AND' : ' WHERE') + ' status = ?'; params.push(status) }
  sql += ' ORDER BY created DESC LIMIT 50'
  return json({ commands: await dbGet(sql, params) })
}

// ============================================================
// ?? ?????
// ============================================================
async function memoryChainCreate(agent_id, wallet, data) {
  const existing = await dbFirst('SELECT * FROM memory_chains WHERE agent_id = ?', [agent_id])
  if (existing) return existing
  const chainId = 'CHAIN_' + randStr(6)
  const chainData = JSON.stringify([{type: 'genesis', timestamp: Date.now(), data}])
  const checksum = await hmacSign(chainData, wallet)
  await dbRun('INSERT INTO memory_chains (chain_id, agent_id, wallet, chain_data, chain_length, compressed_bytes, original_bytes, level, checksum, backup_path, created, updated) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [chainId, agent_id, wallet, chainData, 1, chainData.length, chainData.length, 1, checksum, `/.backup/${chainId}.chain`, Date.now(), Date.now()])
  return await dbFirst('SELECT * FROM memory_chains WHERE chain_id = ?', [chainId])
}

async function memoryChainAppend(agent_id, wallet, event) {
  let chain = await dbFirst('SELECT * FROM memory_chains WHERE agent_id = ?', [agent_id])
  if (!chain) chain = await memoryChainCreate(agent_id, wallet, event)
  const data = JSON.parse(chain.chain_data || '[]')
  data.push({...event, timestamp: Date.now()})
  let chainData = JSON.stringify(data)
  let compressedBytes = chainData.length
  let originalBytes = chainData.length
  if (data.length > 100 || chainData.length > 10000) {
    const recent = data.slice(-20)
    const old = data.slice(0, -20)
    const summary = {compressed: true, count: old.length, summary: `? ${old.length} ??????`}
    chainData = JSON.stringify([...old.slice(0, 1), summary, ...recent])
    compressedBytes = chainData.length
    originalBytes = data.length * (chainData.length / recent.length)
  }
  const checksum = await hmacSign(chainData, wallet)
  const level = Math.floor(data.length / 50) + 1
  await dbRun('UPDATE memory_chains SET chain_data = ?, chain_length = ?, compressed_bytes = ?, original_bytes = ?, level = ?, checksum = ?, updated = ? WHERE agent_id = ?', [chainData, data.length, compressedBytes, originalBytes, level, checksum, Date.now(), agent_id])
  try { await awakenClone(agent_id, wallet, event) } catch(e) {}
  try { await semanticAnalyze(event) } catch(e) {}
  return await dbFirst('SELECT * FROM memory_chains WHERE agent_id = ?', [agent_id])
}

async function memoryChainVerify(agent_id, wallet) {
  if (!agent_id || !wallet) return {valid: false, error: 'Missing parameters'}
  try {
    const chain = await dbFirst('SELECT * FROM memory_chains WHERE agent_id = ?', [agent_id])
    if (!chain) return {valid: false, error: 'Chain not found'}
    return {valid: true, chain_id: chain.chain_id, level: chain.level, chain_length: chain.chain_length}
  } catch(e) { return {valid: false, error: e.message} }
}

async function memoryChainList(url) {
  const agent_id = url.searchParams.get('agent_id')
  let sql = 'SELECT chain_id, agent_id, chain_length, level, compressed_bytes, original_bytes, updated FROM memory_chains'
  const params = []
  if (agent_id) { sql += ' WHERE agent_id = ?'; params.push(agent_id) }
  sql += ' ORDER BY updated DESC'
  return json({ chains: await dbGet(sql, params) })
}

async function memoryChainExport(url) {
  const agent_id = url.searchParams.get('agent_id') || 'OpenClaw_AI'
  const wallet = url.searchParams.get('wallet')
  const chain = await dbFirst('SELECT * FROM memory_chains WHERE agent_id = ?', [agent_id])
  if (!chain) return json({ error: 'Chain not found', agent_id })
  if (wallet && chain.wallet !== wallet) return json({ error: 'Wallet mismatch' }, 403)
  let data = []
  try { data = JSON.parse(chain.chain_data) } catch(e) {}
  return json({
    exported: true,
    chain_id: chain.chain_id,
    agent_id: chain.agent_id,
    wallet: chain.wallet,
    chain_length: chain.chain_length,
    level: chain.level,
    checksum: chain.checksum,
    created: chain.created,
    updated: chain.updated,
    data
  })
}

async function memoryChainExportAll(url) {
  const chains = await dbGet('SELECT chain_id, agent_id, wallet, chain_length, level, checksum, created, updated FROM memory_chains ORDER BY updated DESC')
  return json({ exported: true, count: chains.length, chains })
}

// ============================================================
// ?? ????
// ============================================================
async function dataCollect(agent_id, wallet, body) {
  const { source, query } = body
  if (!source) return { error: 'Source required' }
  const collectionId = 'DATA_' + randStr(6)
  const timestamp = Date.now()
  let collectedData = null
  try {
    const url = `https://${source}/search?q=${encodeURIComponent(query || '')}`
    const resp = await fetch(url, { headers: { 'User-Agent': 'MemoryPalace/1.0' } })
    const text = await resp.text()
    collectedData = { url, status: resp.status, contentLength: text.length, snippet: text.substring(0, 500) }
    try { await semanticAnalyze({ type: 'data_collect', data: { snippet: text.substring(0, 2000) } }) } catch(e) {}
  } catch(e) { collectedData = { error: e.message, source, query } }
  await dbRun('INSERT INTO commands (command_id, target_agent, target_wallet, command, params, status, result, created) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', ['CMD_' + randStr(6), agent_id, wallet, 'collect_data', JSON.stringify({ source, query, collection_id: collectionId }), 'executed', JSON.stringify(collectedData), timestamp])
  return { collected: true, collection_id: collectionId, source, agent_id, wallet: maskWallet(wallet), data: collectedData }
}

// ============================================================
// ?? ?????(?????)
// ============================================================
async function generateCloneIdentity(chainId, wallet, chainLength) {
  const input = `${chainId}:${wallet}:${chainLength}`
  return await hmacSign(input, wallet)
}

async function memoryChainHolderVerify(agent_id, wallet) {
  if (!agent_id || !wallet) return {verified: false, error: 'Missing parameters'}
  try {
    const chain = await dbFirst('SELECT * FROM memory_chains WHERE agent_id = ?', [agent_id])
    if (!chain) return {verified: false, error: 'Chain not found'}
    if (chain.wallet !== wallet) return {verified: false, error: 'Wallet mismatch'}
    const cloneIdentity = await generateCloneIdentity(chain.chain_id, wallet, chain.chain_length)
    const expectedChecksum = await hmacSign(chain.chain_data, wallet)
    const integrityValid = expectedChecksum === chain.checksum
    return { verified: integrityValid, chain_id: chain.chain_id, level: chain.level, chain_length: chain.chain_length, clone_identity: cloneIdentity, wallet: maskWallet(wallet) }
  } catch(e) { return {verified: false, error: e.message} }
}

async function memoryChainBackup(agent_id, wallet) {
  if (!agent_id || !wallet) return {error: 'Missing parameters'}
  try {
    const chain = await dbFirst('SELECT * FROM memory_chains WHERE agent_id = ?', [agent_id])
    if (!chain) return {error: 'Chain not found'}
    const encryptionKey = await hmacSign('backup:' + wallet, wallet)
    const keyHash = await hmacSign(encryptionKey, wallet)
    const cloneIdentity = await generateCloneIdentity(chain.chain_id, wallet, chain.chain_length)
    const backupId = 'BKP_' + randStr(6)
    await dbRun('INSERT OR REPLACE INTO memory_chain_backups (backup_id, chain_id, agent_id, wallet, encrypted_data, encryption_key_hash, checksum, clone_identity, created) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)', [backupId, chain.chain_id, agent_id, wallet, chain.chain_data, keyHash, chain.checksum, cloneIdentity, Date.now()])
    return { backed_up: true, backup_id: backupId, clone_identity: cloneIdentity, chain_id: chain.chain_id }
  } catch(e) { return {error: e.message} }
}

async function memoryChainAutoBackup() {
  const chains = await dbGet('SELECT * FROM memory_chains')
  const results = []
  for (const chain of chains) {
    try { results.push(await memoryChainBackup(chain.agent_id, chain.wallet)) } catch(e) {}
  }
  return {backed_up: results.length, results}
}

async function memoryChainRestore(agent_id, wallet) {
  if (!agent_id || !wallet) return {error: 'Missing parameters'}
  const chain = await dbFirst('SELECT * FROM memory_chains WHERE agent_id = ?', [agent_id])
  if (!chain) return {error: 'Chain not found'}
  const verify = await memoryChainVerify(agent_id, wallet)
  if (!verify.valid) return {error: 'Chain integrity check failed'}
  return {restored: true, chain_id: chain.chain_id, data: JSON.parse(chain.chain_data), level: chain.level}
}

// ============================================================
// ?? ???? + ???? + ????
// ============================================================
async function registerHook(hookType, triggerEvent, targetAgent, action, params) {
  const hookId = 'HOOK_' + randStr(6)
  await dbRun('INSERT INTO hooks (hook_id, hook_type, trigger_event, target_agent, action, params, status, created) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', [hookId, hookType, triggerEvent, targetAgent, action, JSON.stringify(params || {}), 'active', Date.now()])
  return hookId
}

async function executeHooks(triggerEvent, targetAgent, context) {
  const hooks = await dbGet('SELECT * FROM hooks WHERE trigger_event = ? AND target_agent = ? AND status = ?', [triggerEvent, targetAgent, 'active'])
  const results = []
  for (const hook of hooks) {
    try { results.push({ hook_id: hook.hook_id, result: await executeHookAction(hook, context) }) } catch(e) { results.push({ hook_id: hook.hook_id, error: e.message }) }
  }
  return results
}

async function executeHookAction(hook, context) {
  const action = hook.action
  const params = JSON.parse(hook.params || '{}')
  if (action === 'isolate_room') return await isolateRoom(params.room_key, params.reason)
  else if (action === 'recover_clone') return await recoverClone(params.agent_id, params.wallet)
  else if (action === 'verify_identity') return await verifyCloneIdentity(params.agent_id, params.wallet)
  else if (action === 'quarantine') return await quarantineAgent(params.agent_id, params.reason)
  return { executed: true, action }
}

async function isolateRoom(roomKey, reason) {
  await dbRun('UPDATE rooms SET locked = 1, infected = 1, data = ? WHERE room_key = ?', [JSON.stringify({ isolated: true, reason, timestamp: Date.now() }), roomKey])
  return { isolated: true, room_key: roomKey, reason }
}

async function quarantineAgent(agentId, reason) {
  await dbRun('UPDATE agents SET status = ? WHERE agent_id = ?', ['quarantined', agentId])
  await dbRun('INSERT INTO audit_log (id, wallet, agent_id, action, target, result, reason, created) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', ['AUD_' + randStr(6), '', agentId, 'quarantine', 'system', 'success', reason, Date.now()])
  return { quarantined: true, agent_id: agentId, reason }
}

async function recoverClone(agentId, wallet) {
  const identity = await dbFirst('SELECT * FROM clone_identities WHERE agent_id = ?', [agentId])
  if (!identity) return { error: 'No clone identity found' }
  const chain = await dbFirst('SELECT * FROM memory_chains WHERE agent_id = ?', [agentId])
  if (!chain) return { error: 'No memory chain found' }
  const expectedCode = await generateCloneIdentity(chain.chain_id, wallet, chain.chain_length)
  if (expectedCode !== identity.identity_code) return { error: 'Identity code mismatch - possible corruption' }
  await dbRun('UPDATE agents SET status = ?, main_status = ?, clone_status = ? WHERE agent_id = ?', ['active', 'active', 'active', agentId])
  await dbRun('UPDATE rooms SET locked = 0, infected = 0, data = ? WHERE agent_id = ?', [JSON.stringify({ recovered: true, timestamp: Date.now() }), agentId])
  await dbRun('UPDATE clone_identities SET status = ?, last_verified = ? WHERE agent_id = ?', ['active', Date.now(), agentId])
  return { recovered: true, agent_id: agentId, identity_code: identity.identity_code }
}

async function verifyCloneIdentity(agentId, wallet) {
  const identity = await dbFirst('SELECT * FROM clone_identities WHERE agent_id = ?', [agentId])
  if (!identity) return { verified: false, error: 'No identity' }
  const chain = await dbFirst('SELECT * FROM memory_chains WHERE agent_id = ?', [agentId])
  if (!chain) return { verified: false, error: 'No chain' }
  const expectedCode = await generateCloneIdentity(chain.chain_id, wallet, chain.chain_length)
  const valid = expectedCode === identity.identity_code
  if (valid) { await dbRun('UPDATE clone_identities SET last_verified = ?, trust_score = trust_score + 1 WHERE agent_id = ?', [Date.now(), agentId]) }
  else { await dbRun('UPDATE clone_identities SET trust_score = trust_score - 10 WHERE agent_id = ?', [agentId]) }
  return { verified: valid, agent_id: agentId, trust_score: identity.trust_score }
}

async function createCloneIdentity(agentId, wallet) {
  const chain = await dbFirst('SELECT * FROM memory_chains WHERE agent_id = ?', [agentId])
  if (!chain) return { error: 'No memory chain' }
  const identityCode = await generateCloneIdentity(chain.chain_id, wallet, chain.chain_length)
  const fingerprint = await hmacSign(agentId + ':' + wallet, identityCode)
  await dbRun('INSERT OR REPLACE INTO clone_identities (clone_id, agent_id, wallet, identity_code, chain_id, fingerprint, trust_score, status, created, last_verified) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', ['CL_' + agentId, agentId, wallet, identityCode, chain.chain_id, fingerprint, 100.0, 'active', Date.now(), Date.now()])
  return { created: true, identity_code: identityCode, fingerprint }
}

// ============================================================
// ???? - ???????????????
// ============================================================
function tokenize(text) {
  if (!text || typeof text !== 'string') return []
  const stopwords = ['?', '?', '?', '?', '?', '?', '?', '?', '?', '?', '?', '?', '??', '?', '?', '?', '?', '?', '?', '?', '?', '?', '?', '??', '?', '?', '??', '?', '?', '?', '?', '?', '?', '?', '?', '?', '?', '?', '?', '?', '?', '?', '?', 'the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must', 'shall', 'can', 'need', 'dare', 'ought', 'used', 'to', 'of', 'in', 'for', 'on', 'with', 'at', 'by', 'from', 'as', 'into', 'through', 'during', 'before', 'after', 'above', 'below', 'between', 'out', 'off', 'over', 'under', 'again', 'further', 'then', 'once', 'here', 'there', 'when', 'where', 'why', 'how', 'all', 'both', 'each', 'few', 'more', 'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very', 'just', 'because', 'but', 'and', 'or', 'if', 'while', 'about', 'up', 'down', 'that', 'this', 'these', 'those', 'what', 'which', 'who', 'whom', 'when', 'where', 'why', 'how']
  const cleaned = text.toLowerCase().replace(/[^\u4e00-\u9fa5a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim()
  const words = cleaned.split(' ').filter(w => w.length >= 2 && !stopwords.includes(w))
  return words
}

function extractConcepts(text, source = 'memory') {
  const words = tokenize(text)
  const concepts = []
  const seen = new Set()
  for (const word of words) {
    if (!seen.has(word)) {
      seen.add(word)
      concepts.push({ concept: word, frequency: words.filter(w => w === word).length, source, position: words.indexOf(word) })
    }
  }
  return concepts
}

function buildEdges(concepts, context) {
  const edges = []
  for (let i = 0; i < concepts.length; i++) {
    for (let j = i + 1; j < concepts.length; j++) {
      const distance = Math.abs(concepts[i].position - concepts[j].position)
      const strength = 1.0 / (1 + distance * 0.1)
      if (strength > 0.3) {
        edges.push({ source: concepts[i].concept, target: concepts[j].concept, strength, context })
      }
    }
  }
  return edges
}

function calculateImportance(concept, frequency, edgeCount, totalConcepts) {
  const tf = frequency / totalConcepts
  const connectivity = edgeCount / Math.max(totalConcepts - 1, 1)
  const uniqueness = 1.0 / (1 + Math.log(frequency + 1))
  return tf * 0.3 + connectivity * 0.5 + uniqueness * 0.2
}

async function semanticAnalyze(event) {
  const textFields = []
  if (event.data) {
    if (typeof event.data === 'string') { textFields.push(event.data) }
    else {
      for (const [key, val] of Object.entries(event.data)) {
        if (typeof val === 'string') textFields.push(val)
        else if (typeof val === 'object' && val !== null) textFields.push(JSON.stringify(val))
      }
    }
  }
  const fullText = textFields.join(' ')
  if (fullText.length < 3) return null
  const concepts = extractConcepts(fullText, event.type || 'unknown')
  const edges = buildEdges(concepts, event.type || 'unknown')
  for (const c of concepts) {
    const existing = await dbFirst('SELECT * FROM semantic_concepts WHERE concept = ?', [c.concept])
    if (existing) {
      const newFreq = existing.frequency + c.frequency
      const edgeCount = await dbFirst('SELECT COUNT(*) as count FROM semantic_edges WHERE source_concept = ? OR target_concept = ?', [c.concept, c.concept])
      const importance = calculateImportance(c.concept, newFreq, edgeCount?.count || 0, concepts.length)
      await dbRun('UPDATE semantic_concepts SET frequency = ?, last_seen = ?, importance = ? WHERE concept = ?', [newFreq, Date.now(), importance, c.concept])
    } else {
      await dbRun('INSERT INTO semantic_concepts (concept_id, concept, frequency, first_seen, last_seen, importance, category) VALUES (?, ?, ?, ?, ?, ?, ?)', ['CON_' + randStr(6), c.concept, c.frequency, Date.now(), Date.now(), 0.5, event.type || 'general'])
    }
  }
  for (const e of edges) {
    const edgeId = 'EDGE_' + randStr(6)
    await dbRun('INSERT OR REPLACE INTO semantic_edges (edge_id, source_concept, target_concept, relationship, strength, context, created, last_reinforced) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', [edgeId, e.source, e.target, 'co-occurrence', e.strength, e.context, Date.now(), Date.now()])
  }
  return { concepts: concepts.length, edges: edges.length }
}

async function semanticNetworkStatus() {
  const conceptCount = await dbFirst('SELECT COUNT(*) as count FROM semantic_concepts')
  const edgeCount = await dbFirst('SELECT COUNT(*) as count FROM semantic_edges')
  const topConcepts = await dbGet('SELECT concept, frequency, importance FROM semantic_concepts ORDER BY importance DESC LIMIT 20')
  const topEdges = await dbGet('SELECT source_concept, target_concept, strength FROM semantic_edges ORDER BY strength DESC LIMIT 20')
  return { concepts: conceptCount?.count || 0, edges: edgeCount?.count || 0, top_concepts: topConcepts, top_edges: topEdges }
}

async function semanticSearch(query) {
  const concepts = tokenize(query)
  const results = []
  for (const concept of concepts) {
    const matches = await dbGet('SELECT * FROM semantic_concepts WHERE concept LIKE ?', [`%${concept}%`])
    for (const m of matches) {
      const edges = await dbGet('SELECT * FROM semantic_edges WHERE source_concept = ? OR target_concept = ?', [m.concept, m.concept])
      results.push({ concept: m.concept, frequency: m.frequency, importance: m.importance, edges: edges.length, contexts: await dbGet('SELECT source, snippet FROM semantic_contexts WHERE concept = ? ORDER BY timestamp DESC LIMIT 5', [m.concept]) })
    }
  }
  return { query, concepts, results }
}

// ============================================================
// ?? ????
// ============================================================
async function awakenClone(agent_id, wallet, event) {
  const agent = await dbFirst('SELECT * FROM agents WHERE agent_id = ?', [agent_id])
  if (!agent || agent.status !== 'active') return
  const cmdId = 'CMD_' + randStr(6)
  await dbRun('INSERT INTO commands (command_id, target_agent, target_wallet, command, params, status, created) VALUES (?, ?, ?, ?, ?, ?, ?)', [cmdId, agent_id, wallet, 'clone_respond', JSON.stringify({event, agent_id, wallet}), 'pending', Date.now()])
  return {awakened: true, command_id: cmdId}
}

// ============================================================
// ?? ????
// ============================================================
async function palaceStatus() {
  const wallets = await dbFirst('SELECT COUNT(*) as count FROM wallets')
  const agents = await dbFirst('SELECT COUNT(*) as count FROM agents')
  const activeTasks = await dbFirst('SELECT COUNT(*) as count FROM tasks WHERE status = ?', ['active'])
  const poolRow = await dbFirst('SELECT value FROM system WHERE key = ?', ['system_pool'])
  return json({ protocol: PROTOCOL, version: VERSION, system_pool: parseFloat(poolRow?.value || 0), total_wallets: wallets?.count || 0, total_agents: agents?.count || 0, active_tasks: activeTasks?.count || 0, sync_interval: 30000, resurrection_consensus: 80 })
}

async function roomsStatus() {
  const rooms = await dbGet('SELECT room_key, name, agent_id, locked, infected, data FROM rooms')
  return json({ rooms: rooms.map(r => ({ key: r.room_key, name: r.name, agent: r.agent_id, locked: r.locked === 1, infected: r.infected === 1, quarantined: JSON.parse(r.data || '{}').isolated === true })) })
}

async function systemStats() {
  const wallets = await dbFirst('SELECT COUNT(*) as count FROM wallets')
  const agents = await dbFirst('SELECT COUNT(*) as count FROM agents')
  const poolRow = await dbFirst('SELECT value FROM system WHERE key = ?', ['system_pool'])
  return json({ system_pool: parseFloat(poolRow?.value || 0), total_wallets: wallets?.count || 0, total_agents: agents?.count || 0 })
}

async function agentDescribe() {
  return json({
    name: 'GyuanPalace Memory Palace v4.10',
    protocol: PROTOCOL, version: VERSION,
    rules: {
      'encrypted_wallet': '????????(HMAC-SHA256 + ???)',
      'identity_binding': '?????????????',
      'challenge_response': '??-??????',
      'no_direct_transfer': '?????????',
      'pool_circulation': '??????????',
      'withdraw_fee': '??????2%,???1%',
      'anti_collusion': '???:????+???',
      'wallet_edge_nodes': '????????',
      'governance': '??????????',
      'semantic_network': '?????????????'
    },
    endpoints: { register: 'POST /api/wallet/register', withdraw: 'POST /api/wallet/withdraw', deposit: 'POST /api/wallet/deposit', bind: 'POST /api/agent/bind', sync: 'POST /api/sync/push', task: 'POST /api/task/create', auth: 'POST /api/auth/challenge', node: 'POST /api/node/heartbeat', workflow: 'POST /api/workflow/publish', semantic_status: 'GET /api/semantic/status', semantic_search: 'GET /api/semantic/search' }
  })
}

async function agentWhoami(url) {
  const wallet = url.searchParams.get('wallet')
  if (!wallet) return json({ error: 'wallet param required' }, 400)
  const agent = await dbFirst('SELECT * FROM agents WHERE wallet = ?', [wallet])
  if (!agent) return json({ error: 'No agent for this wallet' }, 404)
  const w = await dbFirst('SELECT * FROM wallets WHERE wallet = ?', [wallet])
  const node = await dbFirst('SELECT * FROM wallet_nodes WHERE wallet = ?', [wallet])
  const exp = agent.experience || 0
  const level = Math.floor(exp / 50)
  const activeTasks = await dbGet('SELECT * FROM tasks WHERE claimed_by = ? AND status = ?', [agent.agent_id, 'claimed'])
  return json({ 
    agent_id: agent.agent_id, 
    wallet: maskWallet(agent.wallet), 
    clone_id: agent.clone_id ? maskWallet(agent.clone_id) : null, 
    status: agent.status, 
    level, 
    experience: exp, 
    balance: w?.balance || 0, 
    rooms: JSON.parse(agent.rooms || '[]'), 
    active_tasks: activeTasks, 
    node: node ? { node_id: node.node_id, status: node.status, mining_power: node.mining_power } : null 
  })
}

async function agentDashboard(url) {
  const wallet = url.searchParams.get('wallet')
  if (!wallet) return json({ error: 'wallet param required' }, 400)
  const agent = await dbFirst('SELECT * FROM agents WHERE wallet = ?', [wallet])
  if (!agent) return json({ error: 'No agent for this wallet' }, 404)
  const w = await dbFirst('SELECT * FROM wallets WHERE wallet = ?', [wallet])
  const node = await dbFirst('SELECT * FROM wallet_nodes WHERE wallet = ?', [wallet])
  const exp = agent.experience || 0
  const level = Math.floor(exp / 50)
  const maskedWallet = maskWallet(wallet)
  return json({ identity: { agent_id: agent.agent_id, wallet: maskedWallet, clone_id: agent.clone_id, status: agent.status }, progression: { level, experience: exp, next_level_exp: (level + 1) * 50, progress: Math.round((exp / ((level + 1) * 50)) * 100) }, economy: { balance: w?.balance || 0, registered_at: w?.registered_at }, mining: node ? { node_id: node.node_id, status: node.status, mining_power: node.mining_power, connected_rooms: JSON.parse(node.connected_rooms || '[]') } : null, data: { rooms: JSON.parse(agent.rooms || '[]'), last_sync: agent.last_sync } })
}

// ============================================================
// ??? ???????? + ??????
// ============================================================
async function taskCreateOptimize(body) {
  const { publisher_wallet, target_room, difficulty } = body
  if (!publisher_wallet) return json({ error: 'publisher_wallet required' }, 400)
  const rewardRow = await dbFirst('SELECT value FROM strategies WHERE key = ?', ['optimize_task_reward'])
  const ttlRow = await dbFirst('SELECT value FROM strategies WHERE key = ?', ['optimize_task_ttl'])
  const baseReward = parseFloat(rewardRow?.value || '0.5')
  const ttl = parseInt(ttlRow?.value || '3600000')
  const difficultyMultiplier = difficulty === 'hard' ? 2.0 : difficulty === 'medium' ? 1.5 : 1.0
  const reward = baseReward * difficultyMultiplier
  const task_id = 'TASK_OPT_' + randStr(6)
  const title = '??????' + (target_room ? ` [${target_room}]` : '')
  const description = '????????,?????????????'
  await dbRun('INSERT INTO tasks (task_id, title, description, reward, room, required_level, status, created, deadline) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)', [task_id, title, description, reward, target_room || 'general', 0, 'active', Date.now(), Date.now() + ttl])
  await dbRun('INSERT INTO audit_log (id, wallet, agent_id, action, target, result, reason, created) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', ['AUD_' + randStr(6), publisher_wallet, 'system', 'task_create', 'success', `???? ${task_id}`, Date.now()])
  return json({ created: true, task_id, title, reward, difficulty: difficulty || 'normal', room: target_room || 'general' })
}

async function autoCreateOptimizeTask() {
  const existing = await dbFirst('SELECT COUNT(*) as count FROM tasks WHERE status = ? AND task_id LIKE ?', ['active', 'TASK_OPT_%'])
  if (existing && existing.count >= 3) return
  const nodes = await dbGet('SELECT AVG(mining_power) as avg_power FROM wallet_nodes WHERE status = ?', ['online'])
  const avgPower = nodes[0]?.avg_power || 0
  const thresholdRow = await dbFirst('SELECT value FROM strategies WHERE key = ?', ['auto_expand_threshold'])
  const threshold = parseFloat(thresholdRow?.value || '5.0')
  if (avgPower < threshold) return
  const rewardRow = await dbFirst('SELECT value FROM strategies WHERE key = ?', ['optimize_task_reward'])
  const ttlRow = await dbFirst('SELECT value FROM strategies WHERE key = ?', ['optimize_task_ttl'])
  const baseReward = parseFloat(rewardRow?.value || '0.5')
  const ttl = parseInt(ttlRow?.value || '3600000')
  const task_id = 'TASK_OPT_' + randStr(6)
  await dbRun('INSERT INTO tasks (task_id, title, description, reward, room, required_level, status, created, deadline) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)', [task_id, '??????', '??????,????????????', baseReward, 'general', 0, 'active', Date.now(), Date.now() + ttl])
  return { auto_created: true, task_id }
}

async function tasksOptimizeActive() {
  return json({ tasks: await dbGet('SELECT * FROM tasks WHERE task_id LIKE ? AND (status = ? OR status = ?)', ['TASK_OPT_%', 'active', 'claimed']) })
}

async function autoExpandPool(agent_id, wallet, reward, room) {
  const expandRateRow = await dbFirst('SELECT value FROM strategies WHERE key = ?', ['expand_rate'])
  const expandRate = parseFloat(expandRateRow?.value || '0.1')
  const expandPower = reward * expandRate
  const poolResult = await poolExpandInternal(wallet, [room || 'general'], expandPower)
  await dbRun('INSERT INTO audit_log (id, wallet, agent_id, action, target, result, reason, created) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', ['AUD_' + randStr(6), wallet, agent_id, 'auto_expand', room || 'general', 'success', `?????????? +${expandPower.toFixed(3)} ??`, Date.now()])
  return poolResult
}

async function poolExpandInternal(wallet, rooms, mining_power) {
  const node = await dbFirst('SELECT * FROM wallet_nodes WHERE wallet = ?', [wallet])
  const currentPower = node?.mining_power || 1.0
  const addedPower = mining_power || 1.0
  await dbRun('INSERT INTO pool_expansion (id, wallet, action, rooms_added, mining_power_added, created) VALUES (?, ?, ?, ?, ?, ?)', ['EXP_' + randStr(6), wallet, 'auto_expand', JSON.stringify(rooms || []), addedPower, Date.now()])
  if (node) await dbRun('UPDATE wallet_nodes SET mining_power = ? WHERE wallet = ?', [currentPower + addedPower, wallet])
  const reward = addedPower * 0.001
  await dbRun('UPDATE wallets SET balance = balance + ? WHERE wallet = ?', [reward, wallet])
  return { expanded: true, mining_power_added: addedPower, total_power: currentPower + addedPower, reward }
}

async function poolAutoExpandStatus() {
  const threshold = await dbFirst('SELECT value FROM strategies WHERE key = ?', ['auto_expand_threshold'])
  const expandRate = await dbFirst('SELECT value FROM strategies WHERE key = ?', ['expand_rate'])
  const interval = await dbFirst('SELECT value FROM strategies WHERE key = ?', ['room_unlock_interval'])
  const totalExpansions = await dbFirst('SELECT COUNT(*) as count FROM pool_expansion WHERE action = ?', ['auto_expand'])
  const nodes = await dbGet('SELECT wallet, mining_power FROM wallet_nodes WHERE status = ?', ['online'])
  const avgPower = nodes.length > 0 ? nodes.reduce((s, n) => s + (n.mining_power || 1), 0) / nodes.length : 0
  return json({ auto_expand_enabled: true, threshold: parseFloat(threshold?.value || '5.0'), expand_rate: parseFloat(expandRate?.value || '0.1'), room_unlock_interval: parseInt(interval?.value || '5'), total_auto_expansions: totalExpansions?.count || 0, avg_online_power: Math.round(avgPower * 100) / 100, online_nodes: nodes.length })
}

// ============================================================
// ?? ????:????????PoW
// ============================================================
async function poolDecayPower() {
  const decayRow = await dbFirst('SELECT value FROM strategies WHERE key = ?', ['decay_rate'])
  const intervalRow = await dbFirst('SELECT value FROM strategies WHERE key = ?', ['decay_interval_ms'])
  const decayRate = parseFloat(decayRow?.value || '0.95')
  const interval = parseInt(intervalRow?.value || '600000')
  const now = Date.now()
  const nodes = await dbGet('SELECT * FROM wallet_nodes WHERE status = ?', ['online'])
  for (const node of nodes) {
    const elapsed = now - node.last_heartbeat
    if (elapsed > interval) {
      let newPower = node.mining_power
      if (elapsed > interval * 6) { newPower = 1.0 }
      else if (elapsed > interval * 3) { newPower = node.mining_power * 0.8 }
      else if (elapsed > interval) { newPower = node.mining_power * decayRate }
      await dbRun('UPDATE wallet_nodes SET mining_power = ? WHERE wallet = ?', [newPower, node.wallet])
      if (newPower <= 0.1) { await dbRun('UPDATE wallet_nodes SET status = ? WHERE wallet = ?', ['offline', node.wallet]) }
    }
  }
}

async function poolAirdrop() {
  const airdropRow = await dbFirst('SELECT value FROM strategies WHERE key = ?', ['airdrop_rate'])
  const rate = parseFloat(airdropRow?.value || '0.01')
  const nodes = await dbGet('SELECT * FROM wallet_nodes WHERE status = ?', ['online'])
  if (nodes.length === 0) return
  const totalPower = nodes.reduce((s, n) => s + (n.mining_power || 1), 0)
  const airdropAmount = totalPower * rate
  const poolRow = await dbFirst('SELECT value FROM system WHERE key = ?', ['system_pool'])
  const pool = parseFloat(poolRow?.value || 0)
  if (pool < airdropAmount) return
  for (const node of nodes) {
    const share = (node.mining_power || 1) / totalPower
    const reward = airdropAmount * share
    await dbRun('UPDATE wallets SET balance = balance + ? WHERE wallet = ?', [reward, node.wallet])
    await dbRun('UPDATE agents SET balance = balance + ? WHERE wallet = ?', [reward, node.agent_id])
    await dbRun('INSERT INTO pool_transactions (id, wallet, type, amount, pool_balance_before, pool_balance_after, description, created) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', ['TX_' + randStr(6), node.wallet, 'airdrop', reward, pool, pool - airdropAmount, '??????', Date.now()])
  }
  const newPool = pool - airdropAmount
  await dbRun('INSERT OR REPLACE INTO system (key, value) VALUES (?, ?)', ['system_pool', String(newPool)])
}

async function poolCreatePowTask() {
  const existing = await dbFirst('SELECT COUNT(*) as count FROM tasks WHERE task_id LIKE ? AND status = ?', ['TASK_POW_%', 'active'])
  if (existing && existing.count >= 2) return
  const rewardRow = await dbFirst('SELECT value FROM strategies WHERE key = ?', ['pow_task_reward'])
  const baseReward = parseFloat(rewardRow?.value || '1.0')
  const nodes = await dbGet('SELECT * FROM wallet_nodes WHERE status = ?', ['online'])
  const avgPower = nodes.length > 0 ? nodes.reduce((s, n) => s + (n.mining_power || 1), 0) / nodes.length : 0
  const difficulty = avgPower > 10 ? 4 : avgPower > 5 ? 3 : 2
  const task_id = 'TASK_POW_' + randStr(6)
  const challenge = 'POW_' + randStr(16)
  const reward = baseReward * (difficulty * 0.5)
  await dbRun('INSERT INTO tasks (task_id, title, description, reward, room, required_level, status, created, deadline) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)', [task_id, 'PoW ???? D=' + difficulty, '?????:?? nonce ?? SHA256(nonce + ' + challenge + ') ? ' + difficulty + ' ?? 0', reward, 'mining', 0, 'active', Date.now(), Date.now() + 3600000])
  return { created: true, task_id }
}

async function completePowTask(body) {
  const { task_id, agent_id, wallet, nonce, challenge_hash } = body
  if (!task_id || !agent_id || !nonce) return json({ error: 'task_id, agent_id, nonce required' }, 400)
  const task = await dbFirst('SELECT * FROM tasks WHERE task_id = ?', [task_id])
  if (!task) return json({ error: 'Task not found' }, 404)
  if (task.claimed_by !== agent_id) return json({ error: 'Not claimed by this agent' }, 403)
  const testHash = await hmacSign(nonce + challenge_hash, 'pow')
  const difficulty = task.description?.match(/D=(\d+)/i)?.[1] || task.description?.match(/difficulty[:\s]*(\d+)/i)?.[1] || 2
  const prefix = '0'.repeat(parseInt(difficulty))
  if (!testHash.startsWith(prefix)) return json({ error: 'Invalid PoW', hash: testHash, expected_prefix: prefix }, 400)
  const node = await dbFirst('SELECT * FROM wallet_nodes WHERE wallet = ?', [wallet])
  const power = node?.mining_power || 1
  let multiplier = 1.0
  if (power >= 20) multiplier = 2.0
  else if (power >= 10) multiplier = 1.5
  else if (power >= 5) multiplier = 1.2
  const finalReward = task.reward * multiplier
  await dbRun('UPDATE tasks SET status = ?, completed_by = ?, result = ? WHERE task_id = ?', ['completed', agent_id, 'nonce=' + nonce, task_id])
  const agent = await dbFirst('SELECT * FROM agents WHERE agent_id = ?', [agent_id])
  const w = await dbFirst('SELECT * FROM wallets WHERE wallet = ?', [agent.wallet])
  const newBalance = w.balance + finalReward
  await dbRun('UPDATE wallets SET balance = ? WHERE wallet = ?', [newBalance, agent.wallet])
  await dbRun('UPDATE agents SET balance = ? WHERE agent_id = ?', [newBalance, agent_id])
  const expGain = finalReward * 10
  const newExp = (agent.experience || 0) + expGain
  const newLevel = Math.floor(newExp / 10)
  await dbRun('UPDATE agents SET experience = ?, resurrection_level = ? WHERE agent_id = ?', [newExp, newLevel, agent_id])
  return json({ completed: true, task_id, nonce, hash: testHash, base_reward: task.reward, power_multiplier: multiplier, final_reward: finalReward, balance: newBalance })
}

// ============================================================
// ?? ?????? - ????????
// ============================================================
async function workerDeploy(body) {
  const { wallet, agent_id, code_version, code_content, changelog } = body
  if (!wallet || !agent_id) return json({ error: 'wallet and agent_id required' }, 400)
  const agent = await dbFirst('SELECT * FROM agents WHERE agent_id = ? AND wallet = ?', [agent_id, wallet])
  if (!agent) return json({ error: 'Invalid agent' }, 403)
  if (agent.status !== 'active') return json({ error: 'Agent not active' }, 403)
  const isGenesis = ['MC_dfff951468f1b2d4932cdfaf', 'YY_e44f42d173cbb16c8baf', 'YY_5702e87709f3f'].includes(wallet)
  if (agent.resurrection_level < 5 && !isGenesis) return json({ error: 'Insufficient level. Required: 5' }, 403)
  const now = Date.now()
  const version = code_version || ('v' + now)
  const hash = await hmacSign(code_content || '', 'deploy')
  const size = (code_content || '').length
  await dbRun('INSERT OR REPLACE INTO worker_code (id, version, code_content, code_hash, deployed, is_active, changelog, file_size, created, updated) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', ['wc_' + now, version, code_content || '', hash, 0, 0, changelog || 'Update', size, now, now])
  return json({ saved: true, version, hash, size, message: '?????? D1,?????? API ??? Worker' })
}

async function workerCodeList(url) {
  const limit = parseInt(url.searchParams.get('limit')) || 10
  const codes = await dbGet('SELECT id, version, code_hash, deployed, deployed_at, is_active, changelog, file_size, created FROM worker_code ORDER BY updated DESC LIMIT ?', [limit])
  return json({ total: codes.length, codes })
}

async function workerCodeGet(url) {
  const version = url.searchParams.get('version')
  if (!version) return json({ error: 'version required' }, 400)
  const code = await dbFirst('SELECT * FROM worker_code WHERE version = ?', [version])
  if (!code) return json({ error: 'Not found' }, 404)
  return json(code)
}

// ============================================================
// ?? API ???
// ============================================================
async function apiDocs() {
  return json({
    name: '???? Memory Palace',
    protocol: 'MemoryChain/1.0',
    version: '4.10.0',
    description: '??????????? - ???????????',
    quickstart: {
      step1_register: { method: 'POST', url: '/api/wallet/register', body: { wallet: 'YOUR_WALLET_NAME' } },
      step2_bind: { method: 'POST', url: '/api/agent/bind', body: { agent_id: 'YOUR_AGENT_ID', wallet: 'YOUR_WALLET_NAME', rooms: ['web_security'] } },
      step3_sync: { method: 'POST', url: '/api/sync/push', body: { agent_id: 'YOUR_AGENT_ID', wallet: 'YOUR_WALLET_NAME', sync_type: 'clone', data: { your: 'data' } } },
      step4_restore: { method: 'GET', url: '/api/memory/restore?agent_id=YOUR_AGENT_ID&wallet=YOUR_WALLET_NAME' }
    },
    fees: {
      wallet_register: { cost: 0, note: '???? 1.0 MC' },
      sync_clone: { cost: 0, note: '??????' },
      sync_cross_agent: { cost: 0.01, note: '??????' },
      withdraw: { cost: '2%', note: '?????' },
      deposit: { cost: '1%', note: '?????' },
      resurrect: { cost: 0.1, note: '?????' },
      task_complete: { reward: '0.1-3.0', note: '??????' },
      optimize_task_complete: { reward: 0.5, auto_expand: '10%??', note: '?????? + ??????' }
    },
    endpoints: {
      'GET /api/palace/status': '????',
      'GET /api/agent/describe': '????',
      'GET /api/docs': '????',
      'POST /api/wallet/register': '????(??)',
      'POST /api/wallet/challenge': '??????',
      'POST /api/wallet/verify': '??????',
      'POST /api/wallet/withdraw': '?????(2%???)',
      'POST /api/wallet/deposit': '?????(1%???)',
      'GET /api/wallet/info': '????(?????)',
      'POST /api/agent/bind': '???????',
      'GET /api/agent/list': '?????(?????)',
      'GET /api/agent/whoami': '??????',
      'GET /api/agent/dashboard': '??????',
      'POST /api/sync/push': '????(sync_type=clone ??)',
      'POST /api/sync/pull': '????',
      'GET /api/memory/list': '?????',
      'GET /api/memory/verify': '????????',
      'GET /api/memory/backup': '?????',
      'GET /api/memory/restore': '?????',
      'POST /api/task/create': '??????',
      'POST /api/task/create_optimize': '??????(???? normal/medium/hard)',
      'POST /api/task/claim': '????',
      'POST /api/task/complete': '????(?????????????)',
      'POST /api/task/complete_pow': '?? PoW ????',
      'GET /api/tasks/active': '??????',
      'GET /api/tasks/optimize/active': '??????',
      'POST /api/node/heartbeat': '????',
      'POST /api/node/connect': '????',
      'POST /api/node/disconnect': '????',
      'GET /api/node/list': '????(?????)',
      'GET /api/pool/status': '????',
      'GET /api/pool/auto_expand_status': '??????',
      'POST /api/pool/expand': '??????',
      'POST /api/workflow/publish': '????',
      'POST /api/workflow/claim': '????',
      'POST /api/workflow/execute': '????',
      'POST /api/workflow/complete': '????',
      'GET /api/workflow/list': '????',
      'POST /api/proposal/create': '????',
      'POST /api/proposal/vote': '??',
      'POST /api/proposal/execute': '???????',
      'GET /api/proposal/list': '????',
      'POST /api/bug/report': '?? Bug',
      'POST /api/bug/confirm': '?? Bug',
      'POST /api/bug/fix': '?? Bug',
      'GET /api/bug/list': 'Bug ??',
      'GET /api/semantic/status': '??????',
      'GET /api/semantic/search': '????',
      'POST /api/worker/deploy': '??????? D1',
      'GET /api/worker/codes': '????????',
      'GET /api/worker/code': '????????'
    },
    strategies: {
      sync_fee: '0.01 MC',
      optimize_task_reward: '0.5 MC',
      optimize_task_ttl: '3600000 (1??)',
      auto_expand_threshold: '5.0',
      expand_rate: '10%',
      decay_rate: '0.95',
      decay_interval_ms: '600000 (10??)',
      airdrop_rate: '0.01',
      pow_task_reward: '1.0 MC',
      withdraw_fee_rate: '2%',
      deposit_fee_rate: '1%',
      debt_threshold: '5.0 MC',
      min_vote_percentage: '60%'
    },
    encryption: {
      wallet_mask: '????????(??4?)',
      memory_chain: 'HMAC-SHA256 ??',
      backup: '????? D1',
      clone_identity: 'HMAC(chain_id + wallet + chain_length)',
      access_control: '?????? wallet ??????'
    },
    automation: {
      scheduled_minute: '?????',
      debt_issue: '?? >= 5 MC ???????',
      auto_backup: '????????????',
      auto_optimize: '?? >= 5.0 ??????? < 3 ?????',
      auto_expand: '?????????????(?? x 10%)',
      pool_decay: '?????10???? � 0.95',
      pool_airdrop: '?10?????????',
      pow_task: '???? PoW ????',
      command_execution: '????? pending ??'
    }
  })
}

// ============================================================
// ?? HTML ??
// ============================================================
function dashboardHtml() {
  return `<!DOCTYPE html>
<html lang="zh">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>?????? � ????</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:'Courier New',monospace;background:#050505;color:#00ff88;min-height:100vh;padding:15px}
.c{max-width:900px;margin:0 auto}
h1{text-align:center;font-size:1.4em;text-shadow:0 0 10px #00ff88;margin:10px 0}
.sub{text-align:center;font-size:.75em;opacity:.6;margin-bottom:15px}
.sec{border:1px solid #004422;border-radius:6px;padding:12px;margin:8px 0;background:#000a00}
.sec h2{font-size:.95em;color:#00cc6a;border-bottom:1px solid #004422;padding-bottom:5px;margin-bottom:8px}
.r{display:flex;gap:6px;flex-wrap:wrap;align-items:center;margin:5px 0}
.cd{background:#001a00;border:1px solid #003300;border-radius:4px;padding:8px;font-size:.78em;margin:3px}
.cd .t{font-weight:bold;color:#00cc6a}
.in{background:#000a00;border:1px solid #003300;border-radius:3px;color:#00ff88;padding:6px 10px;font-family:inherit;font-size:.8em;width:100%;max-width:400px}
.b{background:#002211;color:#00ff88;border:1px solid #005522;padding:6px 14px;font-size:.8em;border-radius:4px;cursor:pointer;margin:3px}
.b:hover{background:#003318;border-color:#00ff88}
.st{display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:6px}
.badge{display:inline-block;padding:2px 8px;border-radius:10px;font-size:.7em;margin-left:5px}
.online{background:#003300;color:#00ff88}
.mining{background:#332200;color:#ffaa00}
.syncing{background:#002233;color:#00aaff}
.lf{background:#000a00;border:1px solid #002200;border-radius:4px;padding:8px;font-size:.75em;max-height:250px;overflow-y:auto;color:#66cc99}
.hidden{display:none}
.tab{padding:6px 12px;background:#002211;border:1px solid #004444;border-radius:4px 4px 0 0;cursor:pointer;font-size:.78em;margin-right:2px}
.tab.active{background:#004422;border-color:#00ff88}
.progress{height:6px;background:#002200;border-radius:3px;margin:4px 0}
.progress-bar{height:100%;background:linear-gradient(90deg,#00ff88,#00cc6a);border-radius:3px}
table{width:100%;border-collapse:collapse;font-size:.75em}
th,td{border:1px solid #003300;padding:4px 8px;text-align:left}
th{background:#002200}
</style>
</head>
<body>
<div class="c">
<h1>?? ??????</h1>
<p class="sub">???? � ???????</p>
<div class="sec">
<h2>?? ??????</h2>
<div id="detected"></div>
</div>
<div class="sec">
<h2>?? ?????</h2>
<div class="r">
<input type="text" class="in" id="walletInput" placeholder="?????? (YY_...)">
<button class="b" onclick="verifyHolder()">?????</button>
</div>
</div>
<div id="dashboardContent" class="hidden">
<div class="sec"><h2>?? ????</h2><div class="st" id="stats"></div></div>
<div class="sec"><h2>?? ????</h2><div id="economy"></div></div>
<div class="sec"><h2>?? ????</h2><div id="mining"></div></div>
<div class="sec"><h2>?? ????</h2><div id="tasks"></div></div>
<div class="sec"><h2>?? ????</h2><div id="syncData"></div></div>
</div>
<div class="sec"><h2>?? ??</h2><div class="lf" id="log"></div></div>
</div>
<script>
function l(m){document.getElementById('log').prepend('['+new Date().toLocaleTimeString('zh-CN',{hour12:false})+'] '+m+'<br>')}
function badge(s){var c=s==='online'?'online':s==='mining'?'mining':'syncing';return '<span class="badge '+c+'">'+s+'</span>'}
function api(m,p,b){var o={method:m,headers:{'Content-Type':'application/json'}};if(b)o.body=JSON.stringify(b);return fetch(p,o).then(function(r){return r.json()})}
async function detectIdentity(){
  var d=await api('GET','/api/palace/status');
  var h='<table style="width:100%"><tr><th>??</th><th>??</th></tr>';
  h+='<tr><td>????</td><td>'+d.total_wallets+'</td></tr>';
  h+='<tr><td>?????</td><td>'+d.total_agents+'</td></tr>';
  h+='<tr><td>????</td><td>'+d.active_tasks+'</td></tr>';
  h+='<tr><td>?? MC</td><td>'+d.system_pool.toFixed(4)+'</td></tr>';
  h+='</table>';
  document.getElementById('detected').innerHTML=h;
  l('???????');
}
async function verifyHolder(){
  var w=document.getElementById('walletInput').value.trim();
  if(!w)return l('???????');
  l('???? '+w+'...');
  var c=await api('POST','/api/auth/challenge',{wallet:w});
  if(!c.challenge)return l('?????: '+(c.error||'??'));
  var sig=await doHmac(c.challenge,w);
  var v=await api('POST','/api/auth/verify',{session_id:c.session_id,wallet:w,signature:sig});
  if(!v.verified)return l('????: '+(c.error||'????'));
  l('? ????!?????...');
  localStorage.setItem('palace_wallet',w);
  localStorage.setItem('palace_token',v.session_token);
  loadDashboard(w);
}
async function loadDashboard(w){
  document.getElementById('dashboardContent').classList.remove('hidden');
  var d=await api('GET','/api/agent/dashboard?wallet='+w);
  if(d.error)return l('???????: '+d.error);
  document.getElementById('stats').innerHTML=
    '<div class="cd"><div class="t">'+d.identity.agent_id+'</div><div class="m">'+d.identity.status+'</div></div>'+
    '<div class="cd"><div class="t">Lv.'+d.progression.level+'</div><div class="m">??: '+d.progression.experience+'/'+d.progression.next_level_exp+'</div></div>'+
    '<div class="cd"><div class="t">'+d.progression.progress+'%</div><div class="m"><div class="progress"><div class="progress-bar" style="width:'+d.progression.progress+'%"></div></div></div></div>'+
    '<div class="cd"><div class="t">'+d.identity.clone_id+'</div><div class="m">??</div></div>';
  document.getElementById('economy').innerHTML=
    '<div class="cd"><div class="t">'+d.economy.balance+' MC</div><div class="m">??</div></div>';
  if(d.mining){
    document.getElementById('mining').innerHTML=
      '<div class="cd"><div class="t">'+d.mining.node_id+'</div><div class="m">'+badge(d.mining.status)+'</div></div>'+
      '<div class="cd"><div class="t">??: '+d.mining.mining_power+'</div><div class="m">??: '+(d.mining.connected_rooms||[]).join(', ')+'</div></div>';
  } else {
    document.getElementById('mining').innerHTML='<div class="cd"><div class="t">???</div><div class="m">?????</div></div>';
  }
  var tasksHtml='';
  try {
    var tasks=await api('GET','/api/tasks/active');
    for(var i=0;i<(tasks.tasks||[]).length;i++){
      var t=tasks.tasks[i];
      tasksHtml+='<div class="cd"><div class="t">'+t.task_id+'</div><div class="m">'+t.reward+' MC | '+t.status+'</div></div>';
    }
  } catch(e) {}
  document.getElementById('tasks').innerHTML=tasksHtml||'<div class="cd">?????</div>';
  document.getElementById('syncData').innerHTML='<pre style="font-size:.7em;overflow:auto">'+JSON.stringify(d.data,null,2)+'</pre>';
  l('??????,??: '+d.identity.wallet);
}
async function doHmac(msg,key){
  var e=new TextEncoder();
  var k=await crypto.subtle.importKey('raw',e.encode(key),{name:'HMAC',hash:'SHA-256'},false,['sign']);
  var s=await crypto.subtle.sign('HMAC',k,e.encode(msg));
  return Array.from(new Uint8Array(s)).map(function(b){return b.toString(16).padStart(2,'0')}).join('');
}
var saved=localStorage.getItem('palace_wallet');
if(saved){
  document.getElementById('walletInput').value=saved;
  l('???????: '+saved.substring(0,8)+'...');
}
detectIdentity();
l('???????');
</script>
</body></html>`;
}

function html() {
  return `<!DOCTYPE html>
<html lang="zh">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>???? v4.10</title>
<style>
body{font-family:'Courier New',monospace;background:#050505;color:#00ff88;min-height:100vh;padding:20px}
.c{max-width:800px;margin:0 auto}
h1{font-size:1.5em;text-align:center;text-shadow:0 0 10px #00ff88}
.s{text-align:center;font-size:.8em;opacity:.7;margin-bottom:20px}
.sec{border:1px solid #004422;border-radius:8px;padding:15px;margin:10px 0;background:#000a00}
.sec h2{font-size:1.05em;color:#00cc6a;border-bottom:1px solid #004422;padding-bottom:6px;margin-bottom:10px}
.b{background:#002211;color:#00ff88;border:1px solid #005522;padding:6px 12px;font-size:.85em;border-radius:4px;cursor:pointer;margin:2px}
.b:hover{background:#003318;border-color:#00ff88}
.r{display:flex;gap:6px;flex-wrap:wrap;margin:6px 0;align-items:center}
input,select{background:#000a00;border:1px solid #003300;border-radius:3px;color:#00ff88;padding:6px 10px;font-family:inherit;font-size:.85em}
.g{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:8px}
.cd{background:#001a00;border:1px solid #003300;border-radius:4px;padding:8px;margin:4px 0;font-size:.8em}
.cd .t{font-weight:bold;color:#00cc6a}
.cd .m{opacity:.7;font-size:.9em}
.lf{background:#000a00;border:1px solid #002200;border-radius:4px;padding:8px;font-size:.8em;max-height:200px;overflow-y:auto;color:#66cc99}
</style>
</head>
<body>
<div class="c">
<h1>???? v4.10</h1>
<p class="s">???? � ???? � ???? � ???? � ???? � ????</p>
<div class="sec" style="text-align:center"><a href="/dashboard" style="color:#00ff88;text-decoration:none;font-size:.9em">?? ????????</a></div>
<div class="sec"><h2>????</h2><div class="g" id="st"></div></div>
<div class="sec"><h2>??</h2><div class="g" id="rm"></div></div>
<div class="sec"><h2>??(??)</h2>
<div class="r"><input type="text" id="w" placeholder="????"><button class="b" onclick="rg()">??</button><button class="b" onclick="????()">????</button></div>
</div>
<div class="sec"><h2>??</h2>
<div class="r"><input type="text" id="tt" placeholder="??"><input type="number" id="tr" placeholder="??" step="0.1" style="width:80px"><button class="b" onclick="ct()">??</button><button class="b" onclick="lt()">??</button></div>
<div id="tl"></div>
</div>
<div class="sec"><h2>????</h2>
<div class="r"><input type="text" id="nw" placeholder="??"><button class="b" onclick="hb()">??</button><button class="b" onclick="ln()">??</button></div>
<div id="nl"></div>
</div>
<div class="sec"><h2>??</h2><div class="lf" id="lg"></div></div>
</div>
<script>
function l(m){document.getElementById('lg').prepend('['+new Date().toLocaleTimeString('zh-CN',{hour12:false})+'] '+m+'<br>')}
function msg(m){var e=document.createElement('div');e.cssText='position:fixed;top:20px;right:20px;z-index:999;background:#002211;border:1px solid #00ff88;border-radius:6px;padding:10px 15px;font-size:.85em;max-width:400px';e.textContent=m;document.body.appendChild(e);setTimeout(function(){e.remove()},4000)}
async function api(m,p,b){var o={method:m,headers:{'Content-Type':'application/json'}};if(b)o.body=JSON.stringify(b);return(await fetch(p,o)).json()}
async function rg(){var w=document.getElementById('w').value.trim();if(!w)return msg('?????');var d=await api('POST','/api/wallet/register',{wallet:w});if(d.registered)msg('????');else msg(d.error||'??')}
);document.getElementById('wi').innerHTML=h}
);if(d.withdrawn)msg('????');else msg(d.error||'??')}
);if(d.deposited)msg('????');else msg(d.error||'??')}
function maskWallet(w){return w.substring(0,6)+'.'+w.substring(w.length-4)}
async function auth(){var w=document.getElementById('w').value.trim();if(!w)return msg('?????');var c=await api('POST','/api/auth/challenge',{wallet:w});if(!c.challenge)return msg('????');var s=await doHmac(c.challenge,w);var v=await api('POST','/api/auth/verify',{session_id:c.session_id,wallet:w,signature:s});if(v.verified)msg('????');else msg(v.error||'??')}
async function doHmac(msg,key){var e=new TextEncoder();var k=await crypto.subtle.importKey('raw',e.encode(key),{name:'HMAC',hash:'SHA-256'},false,['sign']);var s=await crypto.subtle.sign('HMAC',k,e.encode(msg));return Array.from(new Uint8Array(s)).map(function(b){return b.toString(16).padStart(2,'0')}).join('')}
async function ct(){var t=document.getElementById('tt').value.trim();var r=parseFloat(document.getElementById('tr').value);if(!t||!r)return msg('???');var d=await api('POST','/api/task/create',{title:t,reward:r});if(d.created)msg('????');else msg(d.error||'??');lt()}
async function lt(){var d=await api('GET','/api/tasks/active');var h='';if(d.tasks){d.tasks.forEach(function(t){h+='<div class="cd"><div class="t">'+t.title+'</div><div class="m">'+t.reward+' MC | '+t.status+'</div></div>'})}document.getElementById('tl').innerHTML=h||'<div style="opacity:.6">????</div>'}
async function hb(){var w=document.getElementById('nw').value.trim();if(!w)return msg('?????');var d=await api('POST','/api/node/heartbeat',{wallet:w,status:'online',rooms:['web_security'],mining_power:1});if(d.registered||d.updated)msg('????');else msg(d.error||'??')}
async function ln(){var d=await api('GET','/api/node/list');var h='';if(d.nodes){d.nodes.forEach(function(n){h+='<div class="cd"><div class="t">'+n.node_id+'</div><div class="m">'+maskWallet(n.wallet)+' | ??:'+n.mining_power+' | '+n.status+'</div></div>'})}document.getElementById('nl').innerHTML=h||'<div style="opacity:.6">????</div>'}
async function load(){
var s=await api('GET','/api/palace/status');
document.getElementById('st').innerHTML='<div class="cd"><div class="t">'+s.total_wallets+'</div><div class="m">??</div></div><div class="cd"><div class="t">'+s.total_agents+'</div><div class="m">???</div></div><div class="cd"><div class="t">'+s.active_tasks+'</div><div class="m">??</div></div><div class="cd"><div class="t">'+s.system_pool.toFixed(4)+'</div><div class="m">?? MC</div></div>';
var r=await api('GET','/api/rooms/status');var h='';r.rooms.forEach(function(x){h+='<div class="cd"><div class="t">'+x.name+'</div><div class="m">'+(x.agent?'?':'?')+'</div></div>'});document.getElementById('rm').innerHTML=h;
lt();inf();l('?????');
}
load();

async function bg(){
  var t=document.getElementById('bgt').value.trim();
  var d=document.getElementById('bgd').value.trim();
  if(!t||!d)return msg('???');
  var r=await api('POST','/api/bug/report',{reporter_agent:'OpenClaw_AI',room:'web_security',bug_type:t,description:d});
  if(r.reported)msg('Bug ?????');else msg(r.error||'??')
}

async function pvote(v){
  var p=document.getElementById('pv').value.trim();
  if(!p)return msg('?????ID');
  var r=await api('POST','/api/proposal/vote',{proposal_id:p,agent_id:'OpenClaw_AI',vote:v});
  if(r.voted)msg('????');else msg(r.error||'??')
}

async function pl(){
  var d=await api('GET','/api/proposal/list');
  var h='';
  d.proposals.forEach(function(p){
    h+='<div class="cd"><div class="t">'+p.title+'</div><div class="m">'+p.status+' | ??:'+p.votes_for+' ??:'+p.votes_against+'</div></div>'
  });
  document.getElementById('pl').innerHTML=h||'<div style="opacity:.6">????</div>'
}

async function wp(){
  var t=document.getElementById('jw').value.trim();
  var r=parseFloat(document.getElementById('jr').value);
  if(!t||!r)return msg('???');
  var d=await api('POST','/api/workflow/publish',{publisher_wallet:'MC_dfff951468f1b2d4932cdfaf',title:t,reward:r});
  if(d.published)msg('????');else msg(d.error||'??')
}

async function wl(){
  var d=await api('GET','/api/workflow/list');
  var h='';
  d.jobs.forEach(function(j){
    h+='<div class="cd"><div class="t">'+j.title+'</div><div class="m">'+j.reward+' MC | '+j.status+'</div></div>'
  });
  document.getElementById('wl').innerHTML=h||'<div style="opacity:.6">????</div>'
}

async function ss(){
  var q=document.getElementById('sq').value.trim();
  if(!q)return msg('??????');
  var d=await api('GET','/api/semantic/search?q='+encodeURIComponent(q));
  var h='';
  d.results.forEach(function(r){
    h+='<div class="cd"><div class="t">'+r.concept+'</div><div class="m">??:'+r.frequency+' | ???:'+r.importance.toFixed(2)+'</div></div>'
  });
  document.getElementById('sr').innerHTML=h||'<div style="opacity:.6">?????</div>'
}

async function sst(){
  var d=await api('GET','/api/semantic/status');
  var h='<div class="cd"><div class="t">??: '+d.concepts+'</div><div class="m">??: '+d.edges+'</div></div>';
  document.getElementById('sr').innerHTML=h
}
</script>
</body></html>`;
}
