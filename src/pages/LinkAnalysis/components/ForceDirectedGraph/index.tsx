import { useEffect, useRef } from "react"
import * as d3 from 'd3'
import { LinkAnalysisContainer } from "./styles";

interface Node {
  id: string;
  title: string;
  group: number;
  x?: number;
  y?: number;
  fx?: number | null;
  fy?: number | null;
  image?: string | null;
}

interface Link {
  source: string;
  target: string;
  value: number;
}

interface ForceDirectedGraphProps {
  width: number;
  height: number;
  data: {
    nodes: Node[];
    links: Link[];
  }
}

export const ForceDirectedGraph: React.FC<ForceDirectedGraphProps> = ({ width, height, data }) => {
  const svgRef = useRef<SVGSVGElement | null>(null)

  useEffect(() => {
    if (!svgRef.current) return

    const svg = d3.select(svgRef.current)
    svg.selectAll("*").remove()
    // const zoomBehavior = d3
    //   .zoom<SVGSVGElement, unknown>()
    //   .scaleExtent([0.1, 1.5])
    //   .on('zoom', zoomed)
    // svg.call(zoomBehavior)

    // Specify the color scale.
    const color = d3.scaleOrdinal()
    .domain([...Array(3).keys()].map(String)) // Domínio de 0 a 10
    .range(['#000000', '#FF0000', '#00d9ff'])
    // Specify a color scale for links
    const linkColor = d3.scaleOrdinal()
    .domain([...Array(3).keys()].map(String)) // Domínio de 0 a 10
    .range(['#000000', '#FF0000', '#00d9ff'])

    svg.style('background-color', '#e9e9e9')
    
    // Configuração do layout de força
    const simulation = d3
      .forceSimulation<Node>(data.nodes)
      .force('link', d3.forceLink<Node, Link>(data.links).id(d => d.id))
      .force('charge', d3.forceManyBody<Node>().strength(-2200))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .on('tick', ticked);

    // Renderização dos links
    const link = svg
      .append('g')
      .selectAll<SVGLineElement, Link>('line')
      .data(data.links)
      .enter()
      .append('line')
      .attr('stroke', (d) => linkColor(d.value.toString()) as string)
      .attr('stroke-opacity', 0.6)
      .attr('stroke-width', (d) => Math.sqrt(d.value));

    // Renderização dos nós
    const node = svg
      .append('g')
      .attr('stroke', '#fff')
      .attr('stroke-width', 1.5)
      .selectAll('.node')
      .data(data.nodes, (d: any) => d.id)
      .enter()
      .append('g')
      .attr('class', 'node');

    node.append('title')
      .text(d => d.id);

    const circle = node
      .append('circle')
      .attr('r', 20)
      .attr('fill', (d) => color(d.group.toString()) as string);
  
    const image = node
      .append('image')
      .attr('width', 48)
      .attr('height', 48)
      .attr('xlink:href', (d) => d.image ? d.image : '');
    
    const text = node
      .append('text')
      .text((d) => d.title)
      .style("font-size", "12px")
      .attr('stroke-width', 0)

    node.call(
        d3
          .drag<SVGGElement, Node>()
          .on('start', dragstarted)
          .on('drag', dragged)
          .on('end', dragended)
      );

    function ticked() {
      link
        .attr('x1', d => (d.source as unknown as Node).x!)
        .attr('y1', d => (d.source as unknown as Node).y!)
        .attr('x2', d => (d.target as unknown as Node).x!)
        .attr('y2', d => (d.target as unknown as Node).y!);

      image
        .attr('x', (d) => d.x! - 24)
        .attr('y', (d) => d.y! - 24);
      
      text
        .attr('x', (d) => (d.x !== undefined && d.x !== null) ? d.x - 32 : 0)
        .attr('y', (d) => (d.y !== undefined && d.y !== null) ? d.y + 34 : 0);

      circle
        .attr('cx', (d) => d.x!)
        .attr('cy', (d) => d.y!);
    }

    // function zoomed(event: d3.D3ZoomEvent<SVGSVGElement, unknown>) {
    //   svg.selectAll('g').attr('transform', event.transform.toString());
    // }

    function dragstarted(event: d3.D3DragEvent<SVGCircleElement, unknown, Node>) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      event.subject.fx = event.subject.x;
      event.subject.fy = event.subject.y;
    }

    function dragged(event: d3.D3DragEvent<SVGCircleElement, unknown, Node>) {
      event.subject.fx = event.x;
      event.subject.fy = event.y;
    }

    function dragended(event: d3.D3DragEvent<SVGCircleElement, unknown, Node>) {
      if (!event.active) simulation.alphaTarget(0);
      event.subject.fx = null;
      event.subject.fy = null;
    }

    return () => {
      simulation.stop();
    }
  }, [data])
  
  return (
    <LinkAnalysisContainer>
      <svg
        ref={svgRef}
        // width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        style={{ maxWidth: '100%', height: 'auto' }}
      ></svg>
    </LinkAnalysisContainer>
  )
}