// Type declarations for packages without built-in types

declare module 'plotly.js-basic-dist-min' {
  import Plotly from 'plotly.js';
  export default Plotly;
}

declare module 'react-plotly.js/factory' {
  import type { ComponentType } from 'react';
  import type Plotly from 'plotly.js';

  interface PlotParams {
    data: Plotly.Data[];
    layout?: Partial<Plotly.Layout>;
    config?: Partial<Plotly.Config>;
    style?: React.CSSProperties;
    className?: string;
    useResizeHandler?: boolean;
    onInitialized?: (figure: { data: Plotly.Data[]; layout: Partial<Plotly.Layout> }, graphDiv: HTMLElement) => void;
    onUpdate?: (figure: { data: Plotly.Data[]; layout: Partial<Plotly.Layout> }, graphDiv: HTMLElement) => void;
  }

  function createPlotlyComponent(plotly: typeof Plotly): ComponentType<PlotParams>;
  export default createPlotlyComponent;
}
