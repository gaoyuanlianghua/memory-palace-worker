import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { api } from '../api/client';
import type { GraphData, GraphNode, GraphEdge } from '../types';

export function KnowledgeGraph() {
  const svgRef = useRef<SVGSVGElement>(null);
  const [data, setData] = useState<GraphData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const graphData = await api.getGraphData();
        setData(graphData);
      } catch (error) {
        console.error('Failed to fetch graph data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (!data || !svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const width = svgRef.current.clientWidth;
    const height = 500;

    svg.attr('viewBox', `0 0 ${width} ${height}`);

    const g = svg.append('g');

    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.5, 3])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });

    svg.call(zoom);

    const simulation = d3.forceSimulation(data.nodes as any)
      .force('link', d3.forceLink(data.edges as any)
        .id((d: any) => d.id)
        .distance(100))
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(30));

    const link = g.append('g')
      .selectAll('line')
      .data(data.edges)
      .enter()
      .append('line')
      .attr('stroke', '#4b5563')
      .attr('stroke-opacity', 0.6)
      .attr('stroke-width', (d: GraphEdge) => d.weight * 3);

    const node = g.append('g')
      .selectAll('g')
      .data(data.nodes)
      .enter()
      .append('g')
      .attr('cursor', 'pointer')
      .call(d3.drag<SVGGElement, GraphNode>()
        .on('start', (event, d) => {
          if (!event.active) simulation.alphaTarget(0.3).restart();
          d.fx = d.x;
          d.fy = d.y;
        })
        .on('drag', (event, d) => {
          d.fx = event.x;
          d.fy = event.y;
        })
        .on('end', (event, d) => {
          if (!event.active) simulation.alphaTarget(0);
          d.fx = null;
          d.fy = null;
        }))
      .on('click', (_, d) => setSelectedNode(d));

    node.append('circle')
      .attr('r', (d: GraphNode) => 8 + d.quality / 10)
      .attr('fill', (d: GraphNode) => getNodeColor(d.type))
      .attr('stroke', '#fff')
      .attr('stroke-width', 2);

    node.append('text')
      .text((d: GraphNode) => d.title.length > 10 ? d.title.slice(0, 10) + '...' : d.title)
      .attr('x', 12)
      .attr('y', 4)
      .attr('fill', '#9ca3af')
      .attr('font-size', '10px');

    simulation.on('tick', () => {
      link
        .attr('x1', (d: any) => d.source?.x || 0)
        .attr('y1', (d: any) => d.source?.y || 0)
        .attr('x2', (d: any) => d.target?.x || 0)
        .attr('y2', (d: any) => d.target?.y || 0);

      node.attr('transform', (d: GraphNode) => `translate(${d.x || 0},${d.y || 0})`);
    });

    return () => {
      simulation.stop();
    };
  }, [data]);

  const getNodeColor = (type: string): string => {
    const colors: Record<string, string> = {
      knowledge: '#3b82f6',
      code_pattern: '#10b981',
      security: '#ef4444',
      ui_component: '#8b5cf6',
      structure: '#f59e0b',
      tech_news: '#ec4899',
      visualization: '#06b6d4',
      dashboard: '#84cc16',
      full: '#f97316',
      timeline: '#6366f1',
      'api-doc': '#14b8a6',
      'api-test': '#0ea5e9',
      auth: '#dc2626',
      login: '#7c3aed',
      market: '#059669',
      nodes: '#0891b2',
      register: '#be185d',
      rewards: '#b45309',
      scheduled: '#4338ca',
      trades: '#0d9488',
      wallet: '#9333ea',
      workflow: '#65a30d',
      page: '#c2410c',
      '3d_graph': '#7c2d12',
    };
    return colors[type] || '#6b7280';
  };

  const typeLabels: Record<string, string> = {
    knowledge: '知识',
    code_pattern: '代码模式',
    security: '安全',
    ui_component: 'UI组件',
    structure: '结构',
    tech_news: '技术新闻',
    visualization: '可视化',
    dashboard: '仪表盘',
    full: '完整',
    timeline: '时间线',
  };

  return (
    <div className="card">
      <div className="card-header flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <span>🔮</span>
            知识图谱
          </h2>
          <p className="text-sm text-gray-400 mt-1">可视化知识关联</p>
        </div>
        {data && (
          <div className="flex gap-4 text-sm">
            <span className="text-gray-400">
              节点: <span className="text-blue-400 font-semibold">{data.stats.totalNodes}</span>
            </span>
            <span className="text-gray-400">
              连接: <span className="text-purple-400 font-semibold">{data.stats.totalEdges}</span>
            </span>
            <span className="text-gray-400">
              标签: <span className="text-green-400 font-semibold">{data.stats.tagCount}</span>
            </span>
          </div>
        )}
      </div>
      <div className="card-body">
        {loading ? (
          <div className="h-96 bg-gray-700 rounded-lg animate-pulse"></div>
        ) : (
          <div className="relative">
            <svg ref={svgRef} className="w-full h-[500px] bg-gray-800/50 rounded-lg" />

            {selectedNode && (
              <div className="absolute top-4 right-4 w-72 bg-gray-800 border border-gray-700 rounded-lg p-4 shadow-xl">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-semibold text-white">{selectedNode.title}</h3>
                  <button
                    onClick={() => setSelectedNode(null)}
                    className="text-gray-400 hover:text-white"
                  >
                    ✕
                  </button>
                </div>
                <div className="space-y-2 text-sm">
                  <p className="text-gray-400">
                    类型: <span className="text-blue-400">{typeLabels[selectedNode.type] || selectedNode.type}</span>
                  </p>
                  <p className="text-gray-400">
                    质量: <span className="text-green-400">{selectedNode.quality}</span>
                  </p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {selectedNode.tags.map((tag, idx) => (
                      <span key={idx} className="badge bg-gray-700 text-gray-300">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div className="absolute bottom-4 left-4 flex flex-wrap gap-2">
              {Object.entries(typeLabels).slice(0, 6).map(([type, label]) => (
                <div key={type} className="flex items-center gap-1.5 text-xs">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: getNodeColor(type) }}
                  />
                  <span className="text-gray-400">{label}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
