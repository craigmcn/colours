import { config } from "@fortawesome/fontawesome-svg-core";
import "@fortawesome/fontawesome-svg-core/styles.css";

// The CSP (netlify.toml) has no 'unsafe-inline' in style-src, so Font Awesome's
// CSS is bundled from this import instead of injected as a <style> at runtime.
config.autoAddCss = false;

export {
  faBars,
  faCircleInfo,
  faCopy,
} from "@fortawesome/sharp-duotone-light-svg-icons";
