export const ReactFlowExamples = {
  customNodes: {
    nodesCode: `[
        {
          id: '1',
          type: 'input',
          data: { label: 'An input node' },
          position: { x: 0, y: 50 },
          sourcePosition: 'right',
        },
        {
          id: '2',
          type: 'selectorNode',
          data: { onChange: onChange, color: initBgColor },
          style: { border: '1px solid #777', padding: 10 },
          position: { x: 300, y: 50 },
        },
        {
          id: '3',
          type: 'output',
          data: { label: 'Output A' },
          position: { x: 650, y: 25 },
          targetPosition: 'left',
        },
        {
          id: '4',
          type: 'output',
          data: { label: 'Output B' },
          position: { x: 650, y: 100 },
          targetPosition: 'left',
        },
      ]`,
    edgesCode: `[
        {
          id: 'e1-2',
          source: '1',
          target: '2',
          animated: true,
          style: { stroke: '#fff' },
        },
        {
          id: 'e2a-3',
          source: '2',
          target: '3',
          sourceHandle: 'a',
          animated: true,
          style: { stroke: '#fff' },
        },
        {
          id: 'e2b-4',
          source: '2',
          target: '4',
          sourceHandle: 'b',
          animated: true,
          style: { stroke: '#fff' },
        },
      ]`,
  },
  customEdges: {
    nodesCode: `[
        {
          id: 'button-1',
          type: 'input',
          data: { label: 'Button Edge 1' },
          position: { x: 125, y: 0 },
        },
        { id: 'button-2', data: { label: 'Button Edge 2' }, position: { x: 125, y: 200 } },
        {
          id: 'bi-1',
          data: { label: 'Bi Directional 1' },
          position: { x: 0, y: 300 },
          type: 'bidirectional',
          sourcePosition: Position.Right,
          targetPosition: Position.Left,
        },
        {
          id: 'bi-2',
          data: { label: 'Bi Directional 2' },
          position: { x: 250, y: 300 },
          type: 'bidirectional',
          sourcePosition: Position.Right,
          targetPosition: Position.Left,
        },
        {
          id: 'self-1',
          data: { label: 'Self Connecting' },
          position: { x: 125, y: 500 },
          sourcePosition: Position.Right,
          targetPosition: Position.Left,
        },
      ]`,
    edgesCode: `[
        {
          id: 'edge-button',
          source: 'button-1',
          target: 'button-2',
          type: 'buttonedge',
        },
        {
          id: 'edge-bi-1',
          source: 'bi-1',
          target: 'bi-2',
          type: 'bidirectional',
          sourceHandle: 'right',
          targetHandle: 'left',
          markerEnd: { type: MarkerType.ArrowClosed },
        },
        {
          id: 'edge-bi-2',
          source: 'bi-2',
          target: 'bi-1',
          type: 'bidirectional',
          sourceHandle: 'left',
          targetHandle: 'right',
          markerEnd: { type: MarkerType.ArrowClosed },
        },
        {
          id: 'edge-self',
          source: 'self-1',
          target: 'self-1',
          type: 'selfconnecting',
          markerEnd: { type: MarkerType.Arrow },
        },
      ]`,
  },
  differentEdgeTypes: {
    nodesCode: `[
        {
          id: '1',
          data: { label: 'choose' },
          position: {
            x: 0,
            y: 0,
          },
        },
        {
          id: '2',
          data: { label: 'your' },
          position: {
            x: 100,
            y: 100,
          },
        },
        {
          id: '3',
          data: { label: 'desired' },
          position: {
            x: 0,
            y: 200,
          },
        },
        {
          id: '4',
          data: { label: 'edge' },
          position: {
            x: 100,
            y: 300,
          },
        },
        {
          id: '5',
          data: { label: 'type' },
          position: {
            x: 0,
            y: 400,
          },
        },
      ]`,
    edgesCode: `[
        {
          type: 'straight',
          source: '1',
          target: '2',
          id: '1',
          label: 'straight',
        },
        {
          type: 'step',
          source: '2',
          target: '3',
          id: '2',
          label: 'step',
        },
        {
          type: 'smoothstep',
          source: '3',
          target: '4',
          id: '3',
          label: 'smoothstep',
        },
        {
          type: 'bezier',
          source: '4',
          target: '5',
          id: '4',
          label: 'bezier',
        },
      ]`,
  },
}

export const landingPageCodeExamples: any = {
  teachers: {
    nodes: [
      {
        id: 'mitochondria',
        data: {
          label: 'Mitochondria',
        },
        position: {
          x: 250,
          y: -50,
        },
        width: 150,
        height: 40,
        selected: false,
        positionAbsolute: {
          x: 250,
          y: -50,
        },
        dragging: false,
      },
      {
        id: 'cellPhysiology',
        data: {
          label: 'Cell Physiology',
        },
        position: {
          x: 100,
          y: 100,
        },
        width: 150,
        height: 40,
        selected: false,
        positionAbsolute: {
          x: 100,
          y: 100,
        },
        dragging: false,
      },
      {
        id: 'pathology',
        data: {
          label: 'Pathology',
        },
        position: {
          x: 400,
          y: 75,
        },
        width: 150,
        height: 40,
        selected: false,
        positionAbsolute: {
          x: 400,
          y: 75,
        },
        dragging: false,
      },
      {
        id: 'atpSynthesis',
        data: {
          label: 'ATP Synthesis',
        },
        position: {
          x: -25,
          y: 250,
        },
        width: 150,
        height: 40,
        selected: false,
        positionAbsolute: {
          x: -25,
          y: 250,
        },
        dragging: false,
      },
      {
        id: 'caHomeostasis',
        data: {
          label: 'Ca2+ Homeostasis',
        },
        position: {
          x: 175,
          y: 250,
        },
        width: 150,
        height: 40,
        selected: false,
        positionAbsolute: {
          x: 175,
          y: 250,
        },
        dragging: false,
      },
      {
        id: 'metabolicPathways',
        data: {
          label: 'Metabolic Pathways',
        },
        position: {
          x: 375,
          y: 250,
        },
        width: 150,
        height: 40,
        selected: false,
        positionAbsolute: {
          x: 375,
          y: 250,
        },
        dragging: false,
      },
      {
        id: 'radicalProduction',
        data: {
          label: 'Radical Production',
        },
        position: {
          x: 550,
          y: 250,
        },
        width: 150,
        height: 40,
        selected: true,
        positionAbsolute: {
          x: 550,
          y: 250,
        },
        dragging: false,
      },
    ],
    edges: [
      {
        id: 'e1',
        source: 'mitochondria',
        target: 'cellPhysiology',
        label: 'Impacts',
      },
      {
        id: 'e2',
        source: 'mitochondria',
        target: 'pathology',
        label: 'Impacts',
      },
      {
        id: 'e3',
        source: 'cellPhysiology',
        target: 'atpSynthesis',
        label: 'Involved in',
      },
      {
        id: 'e4',
        source: 'cellPhysiology',
        target: 'caHomeostasis',
        label: 'Involved in',
      },
      {
        id: 'e5',
        source: 'pathology',
        target: 'metabolicPathways',
        label: 'Involved in',
      },
      {
        id: 'e6',
        source: 'pathology',
        target: 'radicalProduction',
        label: 'Involved in',
      },
    ],
  },
  engineers: {
    nodes: [
      {
        id: '1',
        data: {
          label: 'Direct short-term behavioral adaptations',
        },
        position: {
          x: 0,
          y: 75,
        },
        width: 150,
        height: 58,
        selected: false,
        positionAbsolute: {
          x: 0,
          y: 75,
        },
        dragging: false,
      },
      {
        id: '2',
        data: {
          label: 'Indirect long-term behavioral adaptations',
        },
        position: {
          x: 350,
          y: 75,
        },
        width: 150,
        height: 58,
        selected: true,
        dragging: false,
        positionAbsolute: {
          x: 350,
          y: 75,
        },
      },
      {
        id: '3',
        data: {
          label: 'Changes in travel behavior',
        },
        position: {
          x: 700,
          y: 75,
        },
        width: 150,
        height: 58,
        selected: false,
        positionAbsolute: {
          x: 700,
          y: 75,
        },
        dragging: false,
      },
      {
        id: '4',
        data: {
          label: 'Increased situational awareness',
        },
        position: {
          x: -75,
          y: 225,
        },
        width: 150,
        height: 58,
        selected: false,
        positionAbsolute: {
          x: -75,
          y: 225,
        },
        dragging: false,
      },
      {
        id: '5',
        data: {
          label: 'Decreased mental and physical workload',
        },
        position: {
          x: 100,
          y: 225,
        },
        width: 150,
        height: 58,
        selected: false,
        positionAbsolute: {
          x: 100,
          y: 225,
        },
        dragging: false,
      },
      {
        id: '6',
        data: {
          label: 'Decrease in aggressive driving',
        },
        position: {
          x: 275,
          y: 225,
        },
        width: 150,
        height: 58,
        selected: false,
        positionAbsolute: {
          x: 275,
          y: 225,
        },
        dragging: false,
      },
      {
        id: '7',
        data: {
          label: 'Overreliance on Autopilot',
        },
        position: {
          x: 450,
          y: 225,
        },
        width: 150,
        height: 58,
        selected: false,
        positionAbsolute: {
          x: 450,
          y: 225,
        },
        dragging: false,
      },
      {
        id: '8',
        data: {
          label: 'More long-distance trips',
        },
        position: {
          x: 800,
          y: 225,
        },
        width: 150,
        height: 58,
        selected: false,
        positionAbsolute: {
          x: 800,
          y: 225,
        },
        dragging: false,
      },
      {
        id: '9',
        data: {
          label: 'Route choice with FSD Beta',
        },
        position: {
          x: 625,
          y: 225,
        },
        width: 150,
        height: 58,
        selected: false,
        positionAbsolute: {
          x: 625,
          y: 225,
        },
        dragging: false,
      },
    ],
    edges: [
      {
        id: 'e1-4',
        source: '1',
        target: '4',
        animated: true,
        markerEnd: {
          type: 'arrow',
        },
        style: {
          stroke: '#FF69B4',
          strokeWidth: 2,
        },
      },
      {
        id: 'e1-5',
        source: '1',
        target: '5',
        animated: true,
        markerEnd: {
          type: 'arrow',
        },
        style: {
          stroke: '#FF69B4',
          strokeWidth: 2,
        },
      },
      {
        id: 'e2-6',
        source: '2',
        target: '6',
        animated: true,
        markerEnd: {
          type: 'arrow',
        },
        style: {
          stroke: '#FF69B4',
          strokeWidth: 2,
        },
      },
      {
        id: 'e2-7',
        source: '2',
        target: '7',
        animated: true,
        markerEnd: {
          type: 'arrow',
        },
        style: {
          stroke: '#FF69B4',
          strokeWidth: 2,
        },
      },
      {
        id: 'e3-8',
        source: '3',
        target: '8',
        animated: true,
        markerEnd: {
          type: 'arrow',
        },
        style: {
          stroke: '#FF69B4',
          strokeWidth: 2,
        },
      },
      {
        id: 'e3-9',
        source: '3',
        target: '9',
        animated: true,
        markerEnd: {
          type: 'arrow',
        },
        style: {
          stroke: '#FF69B4',
          strokeWidth: 2,
        },
      },
    ],
  },
  students: {
    nodes: [
      {
        id: '1',
        data: {
          label: 'British East India Company',
        },
        position: {
          x: 250,
          y: 50,
        },
        width: 150,
        height: 58,
      },
      {
        id: '2',
        data: {
          label: 'Financial problems',
        },
        position: {
          x: 100,
          y: 150,
        },
        width: 150,
        height: 40,
      },
      {
        id: '3',
        data: {
          label: "Parliament's authority over colonies",
        },
        position: {
          x: 400,
          y: 150,
        },
        width: 150,
        height: 58,
      },
      {
        id: '4',
        data: {
          label: 'Boston Tea Party',
        },
        position: {
          x: 250,
          y: 250,
        },
        width: 150,
        height: 40,
      },
      {
        id: '5',
        data: {
          label: 'American Revolution',
        },
        position: {
          x: 100,
          y: 350,
        },
        width: 150,
        height: 40,
      },
      {
        id: '6',
        data: {
          label: 'War of Independence',
        },
        position: {
          x: 400,
          y: 350,
        },
        width: 150,
        height: 40,
      },
      {
        id: '7',
        data: {
          label: 'End of British colonialization',
        },
        position: {
          x: 250,
          y: 450,
        },
        width: 150,
        height: 58,
      },
      {
        id: '8',
        data: {
          label: 'Emergence of the United States',
        },
        position: {
          x: 250,
          y: 550,
        },
        width: 150,
        height: 58,
      },
    ],
    edges: [
      {
        id: '1-2',
        source: '1',
        target: '2',
        label: 'leads to',
        markerEnd: {
          type: 'arrow',
        },
        style: {
          stroke: '#FF69B4',
          strokeWidth: 2,
        },
      },
      {
        id: '1-3',
        source: '1',
        target: '3',
        label: 'leads to',
        markerEnd: {
          type: 'arrow',
        },
        style: {
          stroke: '#FF69B4',
          strokeWidth: 2,
        },
      },
      {
        id: '2-4',
        source: '2',
        target: '4',
        label: 'results in',
        markerEnd: {
          type: 'arrow',
        },
        style: {
          stroke: '#FF69B4',
          strokeWidth: 2,
        },
      },
      {
        id: '3-4',
        source: '3',
        target: '4',
        label: 'results in',
        markerEnd: {
          type: 'arrow',
        },
        style: {
          stroke: '#FF69B4',
          strokeWidth: 2,
        },
      },
      {
        id: '4-5',
        source: '4',
        target: '5',
        label: 'leads to',
        markerEnd: {
          type: 'arrow',
        },
        style: {
          stroke: '#FF69B4',
          strokeWidth: 2,
        },
      },
      {
        id: '4-6',
        source: '4',
        target: '6',
        label: 'leads to',
        markerEnd: {
          type: 'arrow',
        },
        style: {
          stroke: '#FF69B4',
          strokeWidth: 2,
        },
      },
      {
        id: '5-7',
        source: '5',
        target: '7',
        label: 'results in',
        markerEnd: {
          type: 'arrow',
        },
        style: {
          stroke: '#FF69B4',
          strokeWidth: 2,
        },
      },
      {
        id: '6-7',
        source: '6',
        target: '7',
        label: 'results in',
        markerEnd: {
          type: 'arrow',
        },
        style: {
          stroke: '#FF69B4',
          strokeWidth: 2,
        },
      },
      {
        id: '7-8',
        source: '7',
        target: '8',
        label: 'leads to',
        markerEnd: {
          type: 'arrow',
        },
        style: {
          stroke: '#FF69B4',
          strokeWidth: 2,
        },
      },
    ],
  },
  healthcare: {
    nodes: [
      {
        id: '1',
        position: {
          x: 50,
          y: 50,
        },
        data: {
          label: 'Cardiac Arrest',
        },
        width: 150,
        height: 40,
      },
      {
        id: '2',
        position: {
          x: 50,
          y: 225,
        },
        data: {
          label:
            'Symptoms (Fatigue, Dizziness, Shortness of breath, Nausea, Chest pain, Heart palpitations, Loss of consciousness)',
        },
        width: 150,
        height: 112,
        selected: false,
        positionAbsolute: {
          x: 50,
          y: 225,
        },
        dragging: false,
      },
      {
        id: '3',
        position: {
          x: 250,
          y: 275,
        },
        data: {
          label:
            'Causes(Arrhythmia, Enlarged heart, Coronary artery disease, Blood loss, Valvular heart disease, Lack of oxygen, High levels of potassium and magnesium)',
        },
        width: 150,
        height: 166,
        selected: false,
        positionAbsolute: {
          x: 250,
          y: 275,
        },
        dragging: false,
      },
      {
        id: '4',
        position: {
          x: 450,
          y: 250,
        },
        data: {
          label:
            'Risk Factors (Alcohol or drug abuse, Family history of heart disease or cardiac arrest, Heart disease, High blood pressure, High cholesterol, Low potassium or magnesium, Obesity, Smoking)',
        },
        width: 150,
        height: 202,
        selected: false,
        positionAbsolute: {
          x: 450,
          y: 250,
        },
        dragging: false,
      },
      {
        id: '5',
        position: {
          x: 550,
          y: 125,
        },
        data: {
          label: 'Difference between cardiac arrest and a heart attack',
        },
        width: 150,
        height: 76,
        selected: false,
        positionAbsolute: {
          x: 550,
          y: 125,
        },
        dragging: false,
      },
      {
        id: '6',
        position: {
          x: 525,
          y: -150,
        },
        data: {
          label: 'Treatment (CPR, Defibrillator)',
        },
        width: 150,
        height: 58,
        selected: false,
        positionAbsolute: {
          x: 525,
          y: -150,
        },
        dragging: false,
      },
      {
        id: '7',
        position: {
          x: 575,
          y: 0,
        },
        data: {
          label: 'Recovery Process',
        },
        width: 150,
        height: 40,
        selected: false,
        positionAbsolute: {
          x: 575,
          y: 0,
        },
        dragging: false,
      },
      {
        id: '8',
        position: {
          x: 325,
          y: -250,
        },
        data: {
          label:
            'Prevention (Eating heart-healthy meals, Losing weight, Exercising, Quitting smoking and drug use, Reducing alcohol intake)',
        },
        width: 150,
        height: 148,
        selected: false,
        positionAbsolute: {
          x: 325,
          y: -250,
        },
        dragging: false,
      },
    ],
    edges: [
      {
        id: 'e1-2',
        source: '1',
        target: '2',
        animated: true,
        style: {
          stroke: '#FF69B4',
          strokeWidth: 2,
        },
        label: 'leads to',
        markerEnd: {
          type: 'arrow',
        },
      },
      {
        id: 'e2-3',
        source: '1',
        target: '3',
        animated: true,
        style: {
          stroke: '#FF69B4',
          strokeWidth: 2,
        },
        label: 'caused by',
        markerEnd: {
          type: 'arrow',
        },
      },
      {
        id: 'e3-4',
        source: '1',
        target: '4',
        animated: true,
        style: {
          stroke: '#FF69B4',
          strokeWidth: 2,
        },
        label: 'risk factors',
        markerEnd: {
          type: 'arrow',
        },
      },
      {
        id: 'e4-5',
        source: '1',
        target: '5',
        animated: true,
        style: {
          stroke: '#FF69B4',
          strokeWidth: 2,
        },
        label: 'distinguished from',
        markerEnd: {
          type: 'arrow',
        },
      },
      {
        id: 'e5-6',
        source: '1',
        target: '6',
        animated: true,
        style: {
          stroke: '#FF69B4',
          strokeWidth: 2,
        },
        label: 'treated by',
        markerEnd: {
          type: 'arrow',
        },
      },
      {
        id: 'e6-7',
        source: '1',
        target: '7',
        animated: true,
        style: {
          stroke: '#FF69B4',
          strokeWidth: 2,
        },
        label: 'followed by',
        markerEnd: {
          type: 'arrow',
        },
      },
      {
        id: 'e7-8',
        source: '1',
        target: '8',
        animated: true,
        style: {
          stroke: '#FF69B4',
          strokeWidth: 2,
        },
        label: 'prevented by',
        markerEnd: {
          type: 'arrow',
        },
      },
    ],
  },
}

export const customNodeCodeExample = `
const nodes = ${ReactFlowExamples.customNodes.nodesCode}

const edges = ${ReactFlowExamples.customNodes.edgesCode}

`

export const customEdgeCodeExample = `
const nodes = ${ReactFlowExamples.customEdges.nodesCode}

const edges = ${ReactFlowExamples.customEdges.edgesCode}

`

export const differentEdgeTypesCodeExample = `
const nodes = ${ReactFlowExamples.differentEdgeTypes.nodesCode}

const edges = ${ReactFlowExamples.differentEdgeTypes.edgesCode}

`

export const allCombinedCodeExample = `
Example One:
\`\`\`javascript
${customNodeCodeExample}
\`\`\`

Example Two:
\`\`\`javascript
${customEdgeCodeExample}
\`\`\`

Example Three:
\`\`\`javascript
${differentEdgeTypesCodeExample}
\`\`\
`

// \`\`\`javascript
// const nodes = [
//   {
//     id: 'A',
//     position: { x: 20, y: 20 },
//     data: { label: 'A' },
//   },
//   {
//     id: 'B',
//     position: { x: 100, y: 200 },
//     data: { label: 'B' },
//   },
//   {
//     id: 'C',
//     position: { x: 300, y: 20 },
//     data: { label: 'C' },
//   },
//   {
//     id: 'D',
//     position: { x: 300, y: 170 },
//     data: { label: 'D' },
//   },
//   {
//     id: 'E',
//     position: { x: 250, y: 300 },
//     data: { label: 'E' },
//   },
//   {
//     id: 'F',
//     position: { x: 250, y: 450 },
//     data: { label: 'F' },
//   },
//   {
//     id: 'G',
//     position: { x: 20, y: 450 },
//     data: { label: 'G' },
//   },
// ];

// const edges = [
//   {
//     id: 'A->B',
//     source: 'A',
//     target: 'B',
//     markerEnd: {
//       type: MarkerType.Arrow,
//     },
//     label: 'default arrow',
//   },
//   {
//     id: 'C->D',
//     source: 'C',
//     target: 'D',
//     markerEnd: {
//       type: MarkerType.ArrowClosed,
//     },
//     label: 'default closed arrow',
//   },
//   {
//     id: 'D->E',
//     source: 'D',
//     target: 'E',
//     markerEnd: {
//       type: MarkerType.ArrowClosed,
//     },
//     markerStart: {
//       type: MarkerType.ArrowClosed,
//       orient: 'auto-start-reverse',
//     },
//     label: 'marker start and marker end',
//   },
//   {
//     id: 'E->F',
//     source: 'E',
//     target: 'F',
//     markerEnd: 'logo',
//     label: 'custom marker',
//   },
//   {
//     id: 'B->G',
//     source: 'B',
//     target: 'G',
//     markerEnd: {
//       type: MarkerType.ArrowClosed,
//       width: 20,
//       height: 20,
//       color: '#FF0072',
//     },
//     label: 'marker size and color',
//     style: {
//       strokeWidth: 2,
//       stroke: '#FF0072',
//     },
//   },
// ];
