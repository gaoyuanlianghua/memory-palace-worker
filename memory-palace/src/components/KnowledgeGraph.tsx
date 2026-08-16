import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { api } from '../api/client';

interface GraphNode {
  id: string;
  title: string;
  type: string;
  tags: string[];
  quality: number;
  x?: number;
  y?: number;
  fx?: number | null;
  fy?: number | null;
  vx?: number;
  vy?: number;
  index?: number;
}

interface GraphEdge {
  source: string | GraphNode;
  target: string | GraphNode;
  weight: number;
}

export function KnowledgeGraph() {
  const svgRef = useRef<SVGSVGElement>(null);
  const [stats, setStats] = useState({ concepts: 0, edges: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await api.getGraphData();
        setStats({
          concepts: data?.concepts || 0,
          edges: data?.edges || 0,
        });
      } catch (error) {
        console.error('Failed to fetch graph data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const width = svgRef.current.clientWidth;
    const height = 400;

    svg.attr('viewBox', `0 0 ${width} ${height}`);

    // 如果没有数据，显示占位图
    if (stats.concepts === 0 && stats.edges === 0) {
      svg.append('text')
        .attr('x', width / 2)
        .attr('y', height / 2)
        .attr('text-anchor', 'middle')
        .attr('fill', '#6b7280')
        .attr('font-size', '16px')
        .text('暂无图谱数据');
      return;
    }

    // 创建示例节点（基于语义网络统计）
    const nodes: GraphNode[] = Array.from({ length: Math.min(stats.concepts, 20) }, (_, i) => ({
      id: `node-${i}`,
      title: `概念 ${i + 1}`,
      type: 'knowledge',
      tags: ['semantic'],
      quality: 70 + Math.random() * 30,
    }));

    const edges: GraphEdge[] = [];
    for (let i = 0; i < nodes.length - 1; i++) {
      edges.push({
        source: nodes[i].id,
        target: nodes[i + 1].id,
        weight: 0.1 + Math.random() * 0.5,
      });
    }

    const g = svg.append('g');

    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.5, 3])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });

    svg.call(zoom);

    const simulation = d3.forceSimulation(nodes as any)
      .force('link', d3.forceLink(edges as any)
        .id((d: any) => d.id)
        .distance(80))
      .force('charge', d3.forceManyBody().strength(-200))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(25));

    const link = g.append('g')
      .selectAll('line')
      .data(edges)
      .enter()
      .append('line')
      .attr('stroke', '#4b5563')
      .attr('stroke-opacity', 0.6)
      .attr('stroke-width', (d: GraphEdge) => d.weight * 2);

    const node = g.append('g')
      .selectAll('g')
      .data(nodes)
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
        }));

    node.append('circle')
      .attr('r', 12)
      .attr('fill', '#3b82f6')
      .attr('stroke', '#fff')
      .attr('stroke-width', 2);

    node.append('text')
      .text((d: GraphNode) => d.title)
      .attr('x', 15)
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
  }, [stats]);

  return (
    <div className="card">
      <div className="card-header flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <span>🔮</span>
            知识图谱
          </h2>
          <p className="text-sm text-gray-400 mt-1">语义网络可视化</p>
        </div>
        <div className="flex gap-4 text-sm">
          <span className="text-gray-400">
            概念: <span className="text-blue-400 font-semibold">{stats.concepts}</span>
          </span>
          <span className="text-gray-400">
            关系: <span className="text-purple-400 font-semibold">{stats.edges}</span>
          </span>
        </div>
      </div>
      <div className="card-body">
        {loading ? (
          <div className="h-96 bg-gray-700 rounded-lg animate-pulse"></div>
        ) : (
          <svg ref={svgRef} className="w-full h-[400px] bg-gray-800/50 rounded-lg" />
        )}
      </div>
    </div>
  );
}
