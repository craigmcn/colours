import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "./components/Layout/Layout";
import { ContrastChecker } from "./pages/ContrastChecker/ContrastChecker";
import { OpacityCalculator } from "./pages/OpacityCalculator/OpacityCalculator";
import { PaletteGenerator } from "./pages/PaletteGenerator/PaletteGenerator";
import { ColourBlender } from "./pages/ColourBlender/ColourBlender";
import { ThemeColours } from "./pages/ThemeColours/ThemeColours";

const App = () => (
  <BrowserRouter basename={import.meta.env.BASE_URL}>
    <Layout>
      <Routes>
        <Route path="/" element={<ContrastChecker />} />
        <Route path="/opacity" element={<OpacityCalculator />} />
        <Route path="/palette" element={<PaletteGenerator />} />
        <Route path="/blender" element={<ColourBlender />} />
        <Route path="/theme" element={<ThemeColours />} />
      </Routes>
    </Layout>
  </BrowserRouter>
);

export default App;
