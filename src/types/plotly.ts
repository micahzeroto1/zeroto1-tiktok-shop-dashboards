// Re-export Plotly types for use across chart components
// This avoids the 'Cannot find namespace Plotly' error in client components
export type { Data as PlotlyData, Layout as PlotlyLayout } from 'plotly.js';
