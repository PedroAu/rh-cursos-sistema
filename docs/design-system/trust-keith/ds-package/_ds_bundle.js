/* @ds-bundle: {"format":3,"namespace":"TrustKeithDesignSystem_e3aaec","components":[{"name":"Avatar","sourcePath":"components/core/Avatar.jsx"},{"name":"Badge","sourcePath":"components/core/Badge.jsx"},{"name":"Button","sourcePath":"components/core/Button.jsx"},{"name":"Card","sourcePath":"components/core/Card.jsx"},{"name":"Checkbox","sourcePath":"components/core/Checkbox.jsx"},{"name":"Input","sourcePath":"components/core/Input.jsx"},{"name":"Logo","sourcePath":"components/core/Logo.jsx"},{"name":"Switch","sourcePath":"components/core/Switch.jsx"},{"name":"FeatureListItem","sourcePath":"components/data/FeatureListItem.jsx"},{"name":"ProgressBar","sourcePath":"components/data/ProgressBar.jsx"},{"name":"StatBlock","sourcePath":"components/data/StatBlock.jsx"},{"name":"Testimonial","sourcePath":"components/data/Testimonial.jsx"},{"name":"NavBar","sourcePath":"components/navigation/NavBar.jsx"}],"sourceHashes":{"components/core/Avatar.jsx":"dd4f6d18ff10","components/core/Badge.jsx":"3b4521c26a17","components/core/Button.jsx":"b1bc0827aae5","components/core/Card.jsx":"a51432df7aaa","components/core/Checkbox.jsx":"b6a1d04dad2c","components/core/Input.jsx":"a2c3f7c9f73a","components/core/Logo.jsx":"819200e88080","components/core/Switch.jsx":"8fe40b57323e","components/data/FeatureListItem.jsx":"4a7d1c2dfbb6","components/data/ProgressBar.jsx":"85af48ac74af","components/data/StatBlock.jsx":"b2f4d0a36564","components/data/Testimonial.jsx":"079d01717492","components/navigation/NavBar.jsx":"1a76322f3eb0","ui_kits/marketing/Hero.jsx":"e79d1876676f","ui_kits/marketing/Sections.jsx":"877a63a27db8","ui_kits/marketing/app.jsx":"989579640613"},"inlinedExternals":[],"unexposedExports":[]} */

(() => {

const __ds_ns = (window.TrustKeithDesignSystem_e3aaec = window.TrustKeithDesignSystem_e3aaec || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// components/core/Avatar.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Trust Keith Avatar. Circular by default. Renders an image when `src` is given,
 * otherwise initials on a soft tinted background. Optional status dot + white ring.
 */
function Avatar({
  src,
  name = "",
  size = 40,
  status,
  ring = false,
  style = {},
  ...rest
}) {
  const initials = name.split(" ").map(w => w[0]).filter(Boolean).slice(0, 2).join("").toUpperCase();
  const statusColor = {
    online: "var(--tk-success)",
    busy: "var(--tk-error)",
    away: "#e6a700"
  };
  return /*#__PURE__*/React.createElement("span", _extends({
    style: {
      position: "relative",
      display: "inline-flex",
      flex: "none",
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("span", {
    style: {
      width: size,
      height: size,
      borderRadius: "50%",
      overflow: "hidden",
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      background: "var(--tk-accent-soft)",
      color: "var(--tk-accent-strong)",
      fontFamily: "var(--tk-font-body)",
      fontWeight: 600,
      fontSize: size * 0.4,
      boxShadow: ring ? "0 0 0 3px var(--tk-surface)" : "none"
    }
  }, src ? /*#__PURE__*/React.createElement("img", {
    src: src,
    alt: name,
    style: {
      width: "100%",
      height: "100%",
      objectFit: "cover"
    }
  }) : initials || "?"), status && /*#__PURE__*/React.createElement("span", {
    style: {
      position: "absolute",
      right: 0,
      bottom: 0,
      width: Math.max(8, size * 0.26),
      height: Math.max(8, size * 0.26),
      borderRadius: "50%",
      background: statusColor[status] || "var(--tk-text-muted)",
      border: "2px solid var(--tk-surface)"
    }
  }));
}
Object.assign(__ds_scope, { Avatar });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Avatar.jsx", error: String((e && e.message) || e) }); }

// components/core/Badge.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Trust Keith Badge / pill. Fully-rounded label for tags, statuses, eyebrows.
 * Default is a white pill with a hairline; tone variants add semantic color.
 */
function Badge({
  tone = "default",
  dot = false,
  children,
  style = {},
  ...rest
}) {
  const tones = {
    default: {
      background: "#ffffff",
      color: "var(--tk-text)",
      border: "1px solid var(--tk-border)"
    },
    brand: {
      background: "var(--tk-brand)",
      color: "#ffffff",
      border: "1px solid transparent"
    },
    accent: {
      background: "var(--tk-accent-soft)",
      color: "var(--tk-accent-strong)",
      border: "1px solid transparent"
    },
    success: {
      background: "rgba(6,132,102,0.12)",
      color: "var(--tk-success)",
      border: "1px solid transparent"
    },
    error: {
      background: "rgba(234,56,76,0.12)",
      color: "var(--tk-error)",
      border: "1px solid transparent"
    },
    muted: {
      background: "var(--tk-surface-2)",
      color: "var(--tk-text-muted)",
      border: "1px solid var(--tk-border)"
    }
  };
  const dotColor = {
    default: "var(--tk-accent)",
    brand: "#ffffff",
    accent: "var(--tk-accent)",
    success: "var(--tk-success)",
    error: "var(--tk-error)",
    muted: "var(--tk-text-muted)"
  };
  return /*#__PURE__*/React.createElement("span", _extends({
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: "0.4rem",
      padding: "0.25rem 0.75rem",
      borderRadius: "var(--tk-radius-pill)",
      fontFamily: "var(--tk-font-body)",
      fontSize: "var(--tk-text-body-sm)",
      fontWeight: 500,
      lineHeight: 1.2,
      whiteSpace: "nowrap",
      ...tones[tone],
      ...style
    }
  }, rest), dot && /*#__PURE__*/React.createElement("span", {
    style: {
      width: 7,
      height: 7,
      borderRadius: "50%",
      background: dotColor[tone],
      flex: "none"
    }
  }), children);
}
Object.assign(__ds_scope, { Badge });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Badge.jsx", error: String((e && e.message) || e) }); }

// components/core/Button.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Trust Keith Button.
 * Teal primary is reserved for the single most important action; bright-blue/secondary
 * and ghost carry everything else. 6px radius, 20px padding, Inter 500.
 */
function Button({
  variant = "primary",
  size = "md",
  iconLeft = null,
  iconRight = null,
  fullWidth = false,
  disabled = false,
  type = "button",
  onClick,
  children,
  style = {},
  ...rest
}) {
  const [hover, setHover] = React.useState(false);
  const [active, setActive] = React.useState(false);
  const sizes = {
    sm: {
      padding: "0.5rem 0.875rem",
      fontSize: "var(--tk-text-caption)",
      minHeight: 32
    },
    md: {
      padding: "0.75rem 1.25rem",
      fontSize: "var(--tk-text-body-sm)",
      minHeight: 44
    },
    lg: {
      padding: "1rem 1.5rem",
      fontSize: "var(--tk-text-body)",
      minHeight: 52
    }
  };
  const variants = {
    primary: {
      background: hover ? "var(--tk-brand-hover)" : "var(--tk-brand)",
      color: "#ffffff",
      border: "1px solid transparent"
    },
    accent: {
      background: hover ? "var(--tk-accent-strong)" : "var(--tk-accent)",
      color: "#ffffff",
      border: "1px solid transparent"
    },
    secondary: {
      background: hover ? "rgba(0,0,0,0.08)" : "rgba(0,0,0,0.05)",
      color: "var(--tk-text)",
      border: "1px solid var(--tk-border)"
    },
    ghost: {
      background: hover ? "rgba(0,0,0,0.04)" : "transparent",
      color: "var(--tk-text)",
      border: "1px solid transparent"
    }
  };
  const base = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "0.5rem",
    width: fullWidth ? "100%" : "auto",
    fontFamily: "var(--tk-font-body)",
    fontWeight: 500,
    lineHeight: 1.2,
    borderRadius: "var(--tk-radius-button)",
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.5 : 1,
    transform: active && !disabled ? "translateY(0.5px)" : "none",
    transition: "background-color var(--tk-duration-fast) var(--tk-ease), transform var(--tk-duration-fast) var(--tk-ease)",
    whiteSpace: "nowrap",
    ...sizes[size],
    ...variants[variant],
    ...style
  };
  return /*#__PURE__*/React.createElement("button", _extends({
    type: type,
    disabled: disabled,
    onClick: onClick,
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => {
      setHover(false);
      setActive(false);
    },
    onMouseDown: () => setActive(true),
    onMouseUp: () => setActive(false),
    style: base
  }, rest), iconLeft, children, iconRight);
}
Object.assign(__ds_scope, { Button });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Button.jsx", error: String((e && e.message) || e) }); }

// components/core/Card.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Trust Keith Card — the brand's signature surface.
 * `standard` = 24px radius, 32px padding, dual-layer glass shadow.
 * `glass`    = 16px radius, lighter ambient shadow (embedded/inline use).
 * `flat`     = hairline border, no shadow (secondary surfaces).
 * Interactive cards lift 2px + dim slightly on hover.
 */
function Card({
  variant = "standard",
  interactive = false,
  padding,
  children,
  style = {},
  ...rest
}) {
  const [hover, setHover] = React.useState(false);
  const variants = {
    standard: {
      borderRadius: "var(--tk-radius-card)",
      padding: padding ?? "var(--tk-space-8)",
      boxShadow: "var(--tk-shadow-card)",
      border: "1px solid var(--tk-border)"
    },
    glass: {
      borderRadius: "var(--tk-radius-glass)",
      padding: padding ?? "1.75rem",
      boxShadow: "var(--tk-shadow-glass)",
      border: "1px solid var(--tk-border)"
    },
    flat: {
      borderRadius: "var(--tk-radius-glass)",
      padding: padding ?? "var(--tk-space-6)",
      boxShadow: "none",
      border: "1px solid var(--tk-border)"
    }
  };
  return /*#__PURE__*/React.createElement("div", _extends({
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    style: {
      background: "var(--tk-surface)",
      color: "var(--tk-text)",
      transition: "transform var(--tk-duration-base) var(--tk-ease), opacity var(--tk-duration-base) var(--tk-ease)",
      cursor: interactive ? "pointer" : "default",
      transform: interactive && hover ? "translateY(-2px)" : "none",
      opacity: interactive && hover ? 0.92 : 1,
      ...variants[variant],
      ...style
    }
  }, rest), children);
}
Object.assign(__ds_scope, { Card });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Card.jsx", error: String((e && e.message) || e) }); }

// components/core/Checkbox.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/** Trust Keith checkbox. Square 4px corners, teal fill + white check when on. */
function Checkbox({
  checked = false,
  onChange,
  disabled = false,
  label,
  id,
  style = {},
  ...rest
}) {
  const cbId = id || React.useId();
  return /*#__PURE__*/React.createElement("label", {
    htmlFor: cbId,
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: "0.625rem",
      cursor: disabled ? "not-allowed" : "pointer",
      opacity: disabled ? 0.5 : 1,
      fontFamily: "var(--tk-font-body)",
      fontSize: "var(--tk-text-body-sm)",
      color: "var(--tk-text)",
      ...style
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 18,
      height: 18,
      borderRadius: "var(--tk-radius-input)",
      background: checked ? "var(--tk-brand)" : "var(--tk-surface)",
      border: `1px solid ${checked ? "var(--tk-brand)" : "var(--tk-border)"}`,
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      flex: "none",
      transition: "background-color var(--tk-duration-fast) var(--tk-ease), border-color var(--tk-duration-fast) var(--tk-ease)"
    }
  }, checked && /*#__PURE__*/React.createElement("svg", {
    width: "11",
    height: "11",
    viewBox: "0 0 12 12",
    fill: "none"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M2.5 6.2L4.8 8.5L9.5 3.5",
    stroke: "#fff",
    strokeWidth: "1.8",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }))), /*#__PURE__*/React.createElement("input", _extends({
    id: cbId,
    type: "checkbox",
    checked: checked,
    disabled: disabled,
    onChange: e => onChange && onChange(e.target.checked, e),
    style: {
      position: "absolute",
      opacity: 0,
      width: 0,
      height: 0
    }
  }, rest)), label && /*#__PURE__*/React.createElement("span", null, label));
}
Object.assign(__ds_scope, { Checkbox });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Checkbox.jsx", error: String((e && e.message) || e) }); }

// components/core/Input.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Trust Keith text input. Near-square (4px radius), hairline border, bright-blue
 * focus ring. Supports label, helper/error text, and a leading adornment.
 */
function Input({
  label,
  helper,
  error,
  type = "text",
  leadingIcon = null,
  id,
  style = {},
  containerStyle = {},
  ...rest
}) {
  const [focus, setFocus] = React.useState(false);
  const inputId = id || React.useId();
  const borderColor = error ? "var(--tk-error)" : focus ? "var(--tk-focus)" : "var(--tk-border)";
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gap: "0.4rem",
      fontFamily: "var(--tk-font-body)",
      ...containerStyle
    }
  }, label && /*#__PURE__*/React.createElement("label", {
    htmlFor: inputId,
    style: {
      fontSize: "var(--tk-text-body-sm)",
      fontWeight: 500,
      color: "var(--tk-text)"
    }
  }, label), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: "0.5rem",
      background: "var(--tk-surface)",
      border: `1px solid ${borderColor}`,
      borderRadius: "var(--tk-radius-input)",
      padding: "0.625rem 0.75rem",
      outline: focus ? "var(--tk-focus-ring)" : "none",
      outlineOffset: "var(--tk-focus-offset)",
      transition: "border-color var(--tk-duration-fast) var(--tk-ease)"
    }
  }, leadingIcon && /*#__PURE__*/React.createElement("span", {
    style: {
      display: "flex",
      color: "var(--tk-text-muted)"
    }
  }, leadingIcon), /*#__PURE__*/React.createElement("input", _extends({
    id: inputId,
    type: type,
    onFocus: () => setFocus(true),
    onBlur: () => setFocus(false),
    style: {
      flex: 1,
      border: "none",
      outline: "none",
      background: "transparent",
      fontFamily: "var(--tk-font-body)",
      fontSize: "var(--tk-text-body-sm)",
      color: "var(--tk-text)",
      ...style
    }
  }, rest))), (helper || error) && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: "var(--tk-text-caption)",
      color: error ? "var(--tk-error)" : "var(--tk-text-muted)"
    }
  }, error || helper));
}
Object.assign(__ds_scope, { Input });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Input.jsx", error: String((e && e.message) || e) }); }

// components/core/Logo.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Trust Keith wordmark (text-based recreation).
 * NOTE: the official SVG logo could not be retrieved from the source; this is a
 * faithful typographic stand-in set in the brand display serif. Swap in the real
 * SVG when available — see assets/README.
 */
function Logo({
  variant = "dark",
  size = 22,
  showMark = true,
  style = {},
  ...rest
}) {
  const color = variant === "light" ? "#ffffff" : "var(--tk-brand)";
  return /*#__PURE__*/React.createElement("span", _extends({
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: "0.5rem",
      fontFamily: "var(--tk-font-display)",
      fontWeight: 700,
      fontSize: size,
      letterSpacing: "-0.02em",
      color,
      lineHeight: 1,
      ...style
    }
  }, rest), showMark && /*#__PURE__*/React.createElement("span", {
    "aria-hidden": "true",
    style: {
      width: size * 1.05,
      height: size * 1.05,
      borderRadius: "30%",
      background: variant === "light" ? "#ffffff" : "var(--tk-brand)",
      color: variant === "light" ? "var(--tk-brand)" : "#ffffff",
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: size * 0.66,
      flex: "none"
    }
  }, "K"), /*#__PURE__*/React.createElement("span", null, "Trust Keith"));
}
Object.assign(__ds_scope, { Logo });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Logo.jsx", error: String((e && e.message) || e) }); }

// components/core/Switch.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/** Trust Keith toggle switch. Pill track, white knob. Teal when on. */
function Switch({
  checked = false,
  onChange,
  disabled = false,
  label,
  id,
  style = {},
  ...rest
}) {
  const switchId = id || React.useId();
  const w = 40,
    h = 24,
    knob = 18;
  return /*#__PURE__*/React.createElement("label", {
    htmlFor: switchId,
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: "0.625rem",
      cursor: disabled ? "not-allowed" : "pointer",
      opacity: disabled ? 0.5 : 1,
      fontFamily: "var(--tk-font-body)",
      fontSize: "var(--tk-text-body-sm)",
      color: "var(--tk-text)",
      ...style
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      position: "relative",
      width: w,
      height: h,
      borderRadius: "var(--tk-radius-pill)",
      background: checked ? "var(--tk-brand)" : "rgba(0,0,0,0.18)",
      transition: "background-color var(--tk-duration-fast) var(--tk-ease)",
      flex: "none"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      position: "absolute",
      top: (h - knob) / 2,
      left: checked ? w - knob - 3 : 3,
      width: knob,
      height: knob,
      borderRadius: "50%",
      background: "#ffffff",
      boxShadow: "0 1px 2px rgba(0,0,0,0.25)",
      transition: "left var(--tk-duration-fast) var(--tk-ease)"
    }
  })), /*#__PURE__*/React.createElement("input", _extends({
    id: switchId,
    type: "checkbox",
    checked: checked,
    disabled: disabled,
    onChange: e => onChange && onChange(e.target.checked, e),
    style: {
      position: "absolute",
      opacity: 0,
      width: 0,
      height: 0
    }
  }, rest)), label && /*#__PURE__*/React.createElement("span", null, label));
}
Object.assign(__ds_scope, { Switch });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Switch.jsx", error: String((e && e.message) || e) }); }

// components/data/FeatureListItem.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Trust Keith feature list item — a check (or custom icon) beside a label.
 * Used in the "what's included" feature lists across the marketing site.
 */
function FeatureListItem({
  children,
  icon,
  tone = "brand",
  style = {},
  ...rest
}) {
  const color = {
    brand: "var(--tk-brand)",
    accent: "var(--tk-accent)",
    success: "var(--tk-success)"
  }[tone];
  return /*#__PURE__*/React.createElement("li", _extends({
    style: {
      display: "flex",
      alignItems: "flex-start",
      gap: "0.625rem",
      fontFamily: "var(--tk-font-body)",
      fontSize: "var(--tk-text-body-lg)",
      lineHeight: 1.45,
      color: "var(--tk-text)",
      listStyle: "none",
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("span", {
    style: {
      flex: "none",
      marginTop: "0.15rem",
      display: "inline-flex",
      color
    }
  }, icon || /*#__PURE__*/React.createElement("svg", {
    width: "18",
    height: "18",
    viewBox: "0 0 20 20",
    fill: "none"
  }, /*#__PURE__*/React.createElement("circle", {
    cx: "10",
    cy: "10",
    r: "10",
    fill: "currentColor",
    opacity: "0.12"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M6 10.5L8.8 13L14 7.5",
    stroke: "currentColor",
    strokeWidth: "1.8",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }))), /*#__PURE__*/React.createElement("span", null, children));
}
Object.assign(__ds_scope, { FeatureListItem });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data/FeatureListItem.jsx", error: String((e && e.message) || e) }); }

// components/data/ProgressBar.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Trust Keith progress / score bar. Rounded track with a colored fill.
 * Used for audit scores, category breakdowns, and completion meters.
 */
function ProgressBar({
  value = 0,
  max = 100,
  label,
  showValue = false,
  tone = "brand",
  height = 8,
  style = {},
  ...rest
}) {
  const pct = Math.max(0, Math.min(100, value / max * 100));
  const fill = {
    brand: "var(--tk-brand)",
    accent: "var(--tk-accent)",
    success: "var(--tk-success)",
    error: "var(--tk-error)"
  }[tone];
  return /*#__PURE__*/React.createElement("div", _extends({
    style: {
      fontFamily: "var(--tk-font-body)",
      ...style
    }
  }, rest), (label || showValue) && /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      marginBottom: "0.4rem",
      fontSize: "var(--tk-text-caption)",
      color: "var(--tk-text-muted)"
    }
  }, /*#__PURE__*/React.createElement("span", null, label), showValue && /*#__PURE__*/React.createElement("span", {
    style: {
      fontWeight: 600,
      color: "var(--tk-text)"
    }
  }, value, max === 100 ? "%" : ` / ${max}`)), /*#__PURE__*/React.createElement("div", {
    style: {
      height,
      borderRadius: "var(--tk-radius-pill)",
      background: "var(--tk-surface-2)",
      overflow: "hidden",
      border: "1px solid var(--tk-border)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: `${pct}%`,
      height: "100%",
      borderRadius: "var(--tk-radius-pill)",
      background: fill,
      transition: "width var(--tk-duration-slow) var(--tk-ease)"
    }
  })));
}
Object.assign(__ds_scope, { ProgressBar });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data/ProgressBar.jsx", error: String((e && e.message) || e) }); }

// components/data/StatBlock.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Trust Keith stat / metric block. Big display-serif number over a muted label.
 * Used in "Trust Keith in numbers" style sections.
 */
function StatBlock({
  value,
  label,
  align = "left",
  accent = false,
  style = {},
  ...rest
}) {
  return /*#__PURE__*/React.createElement("div", _extends({
    style: {
      textAlign: align,
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--tk-font-display)",
      fontWeight: 700,
      fontSize: "var(--tk-text-display-large)",
      lineHeight: 1.05,
      letterSpacing: "-0.02em",
      color: accent ? "var(--tk-brand)" : "var(--tk-text)"
    }
  }, value), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: "0.5rem",
      fontFamily: "var(--tk-font-body)",
      fontSize: "var(--tk-text-body-sm)",
      lineHeight: 1.45,
      color: "var(--tk-text-muted)",
      maxWidth: "22ch",
      marginLeft: align === "center" ? "auto" : 0,
      marginRight: align === "center" ? "auto" : 0
    }
  }, label));
}
Object.assign(__ds_scope, { StatBlock });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data/StatBlock.jsx", error: String((e && e.message) || e) }); }

// components/data/Testimonial.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Trust Keith testimonial. Large serif quote with an author row (avatar + name/role).
 * `featured` renders on a warm cream surface for spotlight sections.
 */
function Testimonial({
  quote,
  name,
  role,
  company,
  avatarSrc,
  featured = false,
  style = {},
  ...rest
}) {
  return /*#__PURE__*/React.createElement("figure", _extends({
    style: {
      margin: 0,
      background: featured ? "var(--tk-cream)" : "var(--tk-surface)",
      border: "1px solid var(--tk-border)",
      borderRadius: "var(--tk-radius-card)",
      padding: featured ? "var(--tk-space-12)" : "var(--tk-space-8)",
      boxShadow: featured ? "none" : "var(--tk-shadow-glass)",
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("blockquote", {
    style: {
      margin: 0,
      fontFamily: "var(--tk-font-serif)",
      fontWeight: featured ? 400 : 300,
      fontSize: featured ? "var(--tk-text-subhead-lg)" : "var(--tk-text-subhead)",
      lineHeight: 1.4,
      color: "var(--tk-text)",
      textWrap: "pretty"
    }
  }, "\u201C", quote, "\u201D"), /*#__PURE__*/React.createElement("figcaption", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: "0.75rem",
      marginTop: "var(--tk-space-6)"
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Avatar, {
    name: name,
    src: avatarSrc,
    size: 44
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--tk-font-body)",
      lineHeight: 1.35
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "var(--tk-text-body-sm)",
      fontWeight: 600,
      color: "var(--tk-text)"
    }
  }, name), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "var(--tk-text-caption)",
      color: "var(--tk-text-muted)"
    }
  }, role, company ? `, ${company}` : ""))));
}
Object.assign(__ds_scope, { Testimonial });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data/Testimonial.jsx", error: String((e && e.message) || e) }); }

// components/navigation/NavBar.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Trust Keith top navigation header. Light-gray surface, hairline base, roomy padding.
 * Composes Logo + nav links + login/CTA. Pass your own link list.
 */
function NavBar({
  links = ["Product", "Solutions", "How it works", "Customers", "Pricing"],
  activeIndex = -1,
  onLinkClick,
  ctaLabel = "Talk to an expert →",
  onCta,
  style = {},
  ...rest
}) {
  return /*#__PURE__*/React.createElement("header", _extends({
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: "var(--tk-space-8)",
      background: "var(--tk-line)",
      borderBottom: "1px solid var(--tk-black-8)",
      padding: "1rem 1.5rem",
      fontFamily: "var(--tk-font-body)",
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement(__ds_scope.Logo, {
    size: 20
  }), /*#__PURE__*/React.createElement("nav", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: "0.25rem",
      flex: 1,
      justifyContent: "center"
    }
  }, links.map((link, i) => /*#__PURE__*/React.createElement("button", {
    key: link,
    onClick: () => onLinkClick && onLinkClick(i, link),
    style: {
      background: "none",
      border: "none",
      cursor: "pointer",
      padding: "0.5rem 0.75rem",
      fontFamily: "var(--tk-font-body)",
      fontSize: "var(--tk-text-body-sm)",
      fontWeight: 500,
      color: "var(--tk-text)",
      borderBottom: i === activeIndex ? "2px solid var(--tk-brand)" : "2px solid transparent",
      opacity: i === activeIndex ? 1 : 0.82
    }
  }, link))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: "0.5rem"
    }
  }, /*#__PURE__*/React.createElement("button", {
    style: {
      background: "none",
      border: "none",
      cursor: "pointer",
      fontFamily: "var(--tk-font-body)",
      fontSize: "var(--tk-text-body-sm)",
      fontWeight: 500,
      color: "var(--tk-text)",
      padding: "0.5rem 0.75rem"
    }
  }, "Log in"), /*#__PURE__*/React.createElement(__ds_scope.Button, {
    variant: "primary",
    size: "sm",
    onClick: onCta
  }, ctaLabel)));
}
Object.assign(__ds_scope, { NavBar });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/NavBar.jsx", error: String((e && e.message) || e) }); }

// ui_kits/marketing/Hero.jsx
try { (() => {
// Trust Keith marketing — Hero + dashboard mock + customer marquee.
const {
  Button,
  Badge
} = window.TrustKeithDesignSystem_e3aaec;
function Arrow() {
  return /*#__PURE__*/React.createElement("svg", {
    width: "14",
    height: "14",
    viewBox: "0 0 16 16",
    fill: "none",
    style: {
      display: 'inline'
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M3 8h9M8.5 4l4 4-4 4",
    stroke: "currentColor",
    strokeWidth: "1.6",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }));
}
function HeroDashboard() {
  // Cosmetic recreation of the product hero dashboard.
  const cats = [{
    n: 'Product',
    s: 78,
    c: 'var(--tk-brand)'
  }, {
    n: 'Marketing',
    s: 62,
    c: 'var(--tk-accent)'
  }, {
    n: 'Company',
    s: 90,
    c: 'var(--tk-success)'
  }];
  return /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'var(--tk-surface)',
      border: '1px solid var(--tk-border)',
      borderRadius: 'var(--tk-radius-card)',
      boxShadow: 'var(--tk-shadow-card)',
      padding: 24,
      display: 'grid',
      gridTemplateColumns: '1.3fr 1fr',
      gap: 18
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gap: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start'
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: 'var(--tk-text-muted)'
    }
  }, "Audit score"), /*#__PURE__*/React.createElement("div", {
    className: "display",
    style: {
      fontSize: 40,
      lineHeight: 1
    }
  }, "526", /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 18,
      color: 'var(--tk-text-muted)'
    }
  }, " / 800"))), /*#__PURE__*/React.createElement(Badge, {
    tone: "success",
    dot: true
  }, "On track")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gap: 12
    }
  }, cats.map(c => /*#__PURE__*/React.createElement("div", {
    key: c.n
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      fontSize: 12,
      marginBottom: 4
    }
  }, /*#__PURE__*/React.createElement("span", null, c.n), /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--tk-text-muted)'
    }
  }, c.s, "%")), /*#__PURE__*/React.createElement("div", {
    style: {
      height: 8,
      background: 'var(--tk-surface-2)',
      borderRadius: 999,
      border: '1px solid var(--tk-border)',
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: c.s + '%',
      height: '100%',
      background: c.c,
      borderRadius: 999
    }
  })))))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'var(--tk-cream)',
      border: '1px solid var(--tk-border)',
      borderRadius: 'var(--tk-radius-glass)',
      padding: 14
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      textTransform: 'uppercase',
      letterSpacing: '0.06em',
      color: 'var(--tk-text-muted)'
    }
  }, "Q1 Risk treatment"), /*#__PURE__*/React.createElement("div", {
    className: "serif",
    style: {
      fontSize: 16,
      marginTop: 4
    }
  }, "3 actions due this week")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gap: 8
    }
  }, ['New supplier detected', 'DPIA drafted', 'Regulation change flagged'].map((t, i) => /*#__PURE__*/React.createElement("div", {
    key: t,
    style: {
      display: 'flex',
      gap: 10,
      alignItems: 'center',
      fontSize: 13
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 8,
      height: 8,
      borderRadius: '50%',
      background: i === 1 ? 'var(--tk-success)' : 'var(--tk-accent)',
      flex: 'none'
    }
  }), /*#__PURE__*/React.createElement("span", null, t)))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 6,
      marginTop: 4
    }
  }, ['#e0eeff', '#fffaf4', '#ebebeb'].map((b, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      flex: 1,
      height: 40,
      borderRadius: 10,
      background: b,
      border: '1px solid var(--tk-border)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 11,
      color: 'var(--tk-text-muted)'
    }
  }, ['You', 'DPO', 'Team'][i])))));
}
function Hero({
  onCta
}) {
  return /*#__PURE__*/React.createElement("section", {
    style: {
      background: 'var(--tk-gradient-hero)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "wrap",
    style: {
      padding: '72px 24px',
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 48,
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gap: 24
    }
  }, /*#__PURE__*/React.createElement(Badge, {
    tone: "default",
    dot: true
  }, "Intelligent Privacy Management"), /*#__PURE__*/React.createElement("h1", {
    className: "display",
    style: {
      fontSize: 60,
      lineHeight: 1.1
    }
  }, "Your always-on privacy partner"), /*#__PURE__*/React.createElement("p", {
    className: "serif",
    style: {
      fontSize: 20,
      fontWeight: 300,
      lineHeight: 1.4,
      color: 'var(--tk-text-muted)',
      margin: 0,
      maxWidth: '46ch'
    }
  }, "Trust Keith holds your hand to get you \u2014 and keep you \u2014 as compliant as you need, with a dedicated human expert and an intelligent platform."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 12,
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    size: "lg",
    onClick: onCta,
    iconRight: /*#__PURE__*/React.createElement(Arrow, null)
  }, "Talk to an expert"), /*#__PURE__*/React.createElement(Button, {
    variant: "secondary",
    size: "lg",
    iconRight: /*#__PURE__*/React.createElement(Arrow, null)
  }, "See how it works"))), /*#__PURE__*/React.createElement(HeroDashboard, null)));
}
function Marquee() {
  const logos = ['Learnerbly', 'Codat', 'Perplexity', 'Capsule', 'Ocean Bottle', 'Lantum', 'Heights', 'FareShare'];
  return /*#__PURE__*/React.createElement("section", {
    className: "wrap",
    style: {
      padding: '40px 24px',
      textAlign: 'center'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "serif",
    style: {
      fontSize: 20,
      color: 'var(--tk-text-muted)',
      marginBottom: 24
    }
  }, "Trusted by the world's best data-centric SMBs"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '20px 40px',
      justifyContent: 'center',
      alignItems: 'center'
    }
  }, logos.map(l => /*#__PURE__*/React.createElement("span", {
    key: l,
    className: "display",
    style: {
      fontSize: 22,
      color: 'var(--tk-text)',
      opacity: 0.5
    }
  }, l))));
}
window.Hero = Hero;
window.Marquee = Marquee;
window.Arrow = Arrow;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/marketing/Hero.jsx", error: String((e && e.message) || e) }); }

// ui_kits/marketing/Sections.jsx
try { (() => {
// Trust Keith marketing — feature sections, stats, testimonial, product grid, CTA, footer.
const {
  Button,
  Badge,
  Card,
  StatBlock,
  Testimonial,
  FeatureListItem
} = window.TrustKeithDesignSystem_e3aaec;
function FeatureSection({
  heading,
  body,
  features,
  reverse
}) {
  const Arrow = window.Arrow;
  const text = /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gap: 18,
      alignContent: 'center'
    }
  }, /*#__PURE__*/React.createElement("h2", {
    className: "display",
    style: {
      fontSize: 32,
      lineHeight: 1.25
    }
  }, heading), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 17,
      lineHeight: 1.45,
      color: 'var(--tk-text-muted)',
      margin: 0,
      maxWidth: '48ch'
    }
  }, body), /*#__PURE__*/React.createElement("ul", {
    style: {
      margin: 0,
      padding: 0,
      display: 'grid',
      gap: 10
    }
  }, features.map(f => /*#__PURE__*/React.createElement(FeatureListItem, {
    key: f
  }, f))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Button, {
    variant: "ghost",
    iconRight: /*#__PURE__*/React.createElement(Arrow, null),
    style: {
      paddingLeft: 0,
      color: 'var(--tk-accent)'
    }
  }, "See how it works")));
  const visual = /*#__PURE__*/React.createElement(Card, {
    variant: "standard",
    style: {
      background: 'var(--tk-surface-2)',
      display: 'grid',
      placeItems: 'center',
      minHeight: 300
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gap: 10,
      width: '82%'
    }
  }, features.slice(0, 4).map((f, i) => /*#__PURE__*/React.createElement("div", {
    key: f,
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      background: 'var(--tk-surface)',
      border: '1px solid var(--tk-border)',
      borderRadius: 'var(--tk-radius-glass)',
      padding: '12px 14px',
      boxShadow: 'var(--tk-shadow-glass)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 28,
      height: 28,
      borderRadius: 8,
      background: i % 2 ? 'var(--tk-cream)' : 'var(--tk-accent-soft)',
      flex: 'none'
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 14,
      fontWeight: 500
    }
  }, f), /*#__PURE__*/React.createElement("span", {
    style: {
      marginLeft: 'auto',
      fontSize: 11,
      color: 'var(--tk-success)',
      fontWeight: 600
    }
  }, "Active")))));
  return /*#__PURE__*/React.createElement("section", {
    className: "wrap",
    style: {
      padding: '48px 24px',
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 48
    }
  }, reverse ? /*#__PURE__*/React.createElement(React.Fragment, null, visual, text) : /*#__PURE__*/React.createElement(React.Fragment, null, text, visual));
}
function Stats() {
  return /*#__PURE__*/React.createElement("section", {
    style: {
      background: 'var(--tk-cream)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "wrap",
    style: {
      padding: '56px 24px'
    }
  }, /*#__PURE__*/React.createElement("h2", {
    className: "display",
    style: {
      fontSize: 32,
      marginBottom: 32
    }
  }, "Trust Keith in numbers"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3,1fr)',
      gap: 32
    }
  }, /*#__PURE__*/React.createElement(StatBlock, {
    value: "28 hrs",
    label: "Saved on due diligence per deal",
    accent: true
  }), /*#__PURE__*/React.createElement(StatBlock, {
    value: "30%",
    label: "Saved on cyber insurance premiums by linking your Audit Score",
    accent: true
  }), /*#__PURE__*/React.createElement(StatBlock, {
    value: "92%",
    label: "Of users highly recommend us",
    accent: true
  }))));
}
function ProductGrid() {
  const Arrow = window.Arrow;
  const items = [['Automated Data Discovery', 'Continuously uncover tools & data hiding across your business'], ['Global Risks & Controls', 'Manage your privacy Risk & Controls for global compliance'], ['Intelligent Workflows', 'Handle Assessments, DSARs, Vendor Risk, Incidents and more'], ['Proportional Policies', 'Expert-tailored policies with built-in Policy Management'], ['Staff Training', 'Enable your team to make the right decisions with personal data'], ['Monitoring & Reporting', 'Always know where you stand and confidently prove it']];
  return /*#__PURE__*/React.createElement("section", {
    className: "wrap",
    style: {
      padding: '48px 24px'
    }
  }, /*#__PURE__*/React.createElement("h2", {
    className: "display",
    style: {
      fontSize: 32,
      marginBottom: 8,
      maxWidth: '20ch'
    }
  }, "Everything you need to run privacy ", /*#__PURE__*/React.createElement("em", null, "properly")), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 17,
      color: 'var(--tk-text-muted)',
      marginTop: 0,
      marginBottom: 28
    }
  }, "In any jurisdiction."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3,1fr)',
      gap: 20
    }
  }, items.map(([t, d]) => /*#__PURE__*/React.createElement(Card, {
    key: t,
    variant: "standard",
    interactive: true
  }, /*#__PURE__*/React.createElement("h3", {
    className: "serif",
    style: {
      fontSize: 20,
      marginBottom: 8
    }
  }, t), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 15,
      lineHeight: 1.5,
      color: 'var(--tk-text-muted)',
      margin: '0 0 14px'
    }
  }, d), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 14,
      fontWeight: 500,
      color: 'var(--tk-accent)',
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6
    }
  }, "Explore ", /*#__PURE__*/React.createElement(Arrow, null))))));
}
function CtaBand({
  onCta
}) {
  const Arrow = window.Arrow;
  return /*#__PURE__*/React.createElement("section", {
    className: "wrap",
    style: {
      padding: '24px 24px 64px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'var(--tk-brand)',
      borderRadius: 'var(--tk-radius-card)',
      padding: '56px 48px',
      textAlign: 'center',
      color: '#fff'
    }
  }, /*#__PURE__*/React.createElement("h2", {
    className: "display",
    style: {
      fontSize: 36,
      marginBottom: 12,
      color: '#fff'
    }
  }, "Ready to do privacy properly?"), /*#__PURE__*/React.createElement("p", {
    className: "serif",
    style: {
      fontSize: 20,
      fontWeight: 300,
      opacity: 0.9,
      margin: '0 auto 28px',
      maxWidth: '46ch'
    }
  }, "Chat to one of our experts and see how we can take privacy off your plate \u2014 for good."), /*#__PURE__*/React.createElement(Button, {
    variant: "accent",
    size: "lg",
    onClick: onCta,
    iconRight: /*#__PURE__*/React.createElement(Arrow, null)
  }, "Talk to an expert")));
}
function Footer() {
  const cols = {
    Features: ['Privacy OS', 'Dedicated DPO', 'Data Discovery', 'Intelligent Workflows', 'Staff Training'],
    Solutions: ['Industry', 'Team', 'Use Case', 'Regulations'],
    Company: ['How it works', 'Customers', 'Pricing', 'Resources']
  };
  return /*#__PURE__*/React.createElement("footer", {
    style: {
      background: 'var(--tk-ink)',
      color: '#fff'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "wrap",
    style: {
      padding: '56px 24px',
      display: 'grid',
      gridTemplateColumns: '1.4fr repeat(3,1fr)',
      gap: 32
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "display",
    style: {
      fontSize: 22,
      color: '#fff',
      marginBottom: 12
    }
  }, "Trust Keith"), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 13,
      color: 'rgba(255,255,255,0.6)',
      lineHeight: 1.5,
      maxWidth: '28ch'
    }
  }, "Your always-on privacy partner. Always-on, audit-ready, off your plate.")), Object.entries(cols).map(([h, links]) => /*#__PURE__*/React.createElement("div", {
    key: h
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      textTransform: 'uppercase',
      letterSpacing: '0.06em',
      color: 'rgba(255,255,255,0.5)',
      marginBottom: 14
    }
  }, h), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gap: 10
    }
  }, links.map(l => /*#__PURE__*/React.createElement("a", {
    key: l,
    href: "#",
    style: {
      fontSize: 14,
      color: 'rgba(255,255,255,0.82)',
      textDecoration: 'none'
    }
  }, l)))))), /*#__PURE__*/React.createElement("div", {
    className: "wrap",
    style: {
      padding: '0 24px 32px',
      fontSize: 12,
      color: 'rgba(255,255,255,0.5)'
    }
  }, "\xA9 Trust Keith 2026. Registered in England and Wales no. 12283797."));
}
window.Sections = {
  FeatureSection,
  Stats,
  ProductGrid,
  CtaBand,
  Footer
};
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/marketing/Sections.jsx", error: String((e && e.message) || e) }); }

// ui_kits/marketing/app.jsx
try { (() => {
// Trust Keith marketing homepage — composition + interactive nav / contact modal.
const {
  NavBar,
  Testimonial,
  Card,
  Button,
  Input
} = window.TrustKeithDesignSystem_e3aaec;
function ContactModal({
  open,
  onClose
}) {
  if (!open) return null;
  return /*#__PURE__*/React.createElement("div", {
    onClick: onClose,
    style: {
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,0.4)',
      display: 'grid',
      placeItems: 'center',
      zIndex: 50,
      padding: 20
    }
  }, /*#__PURE__*/React.createElement("div", {
    onClick: e => e.stopPropagation(),
    style: {
      width: 'min(440px,100%)'
    }
  }, /*#__PURE__*/React.createElement(Card, {
    variant: "standard"
  }, /*#__PURE__*/React.createElement("h3", {
    className: "display",
    style: {
      fontSize: 26,
      marginBottom: 6
    }
  }, "Talk to an expert"), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 15,
      color: 'var(--tk-text-muted)',
      marginTop: 0,
      marginBottom: 20
    }
  }, "Tell us a little about your business and we'll be in touch."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gap: 14
    }
  }, /*#__PURE__*/React.createElement(Input, {
    label: "Full name",
    placeholder: "Jane Doe"
  }), /*#__PURE__*/React.createElement(Input, {
    label: "Work email",
    type: "email",
    placeholder: "jane@company.com"
  }), /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    fullWidth: true,
    onClick: onClose
  }, "Request a call")))));
}
function App() {
  const [modal, setModal] = React.useState(false);
  const [active, setActive] = React.useState(0);
  const open = () => setModal(true);
  const S = window.Sections;
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(NavBar, {
    activeIndex: active,
    onLinkClick: i => setActive(i),
    ctaLabel: "Talk to an expert \u2192",
    onCta: open
  }), /*#__PURE__*/React.createElement(window.Hero, {
    onCta: open
  }), /*#__PURE__*/React.createElement(window.Marquee, null), /*#__PURE__*/React.createElement(S.FeatureSection, {
    heading: "Confidently and continuously comply",
    body: "Stay ahead of external changes like new regulations \u2014 and internal changes like new suppliers, products and territories. Compliance becomes continuous across your business.",
    features: ['Continuous Data Discovery', 'Human-verified Audits', 'Intelligent Workflows', 'A dedicated Registered DPO', '24/7 Breach support']
  }), /*#__PURE__*/React.createElement("section", {
    style: {
      background: 'var(--tk-surface-2)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "wrap",
    style: {
      padding: '8px 24px 8px'
    }
  }, /*#__PURE__*/React.createElement(S.FeatureSection, {
    reverse: true,
    heading: "Operationalise privacy at scale",
    body: "You don't need to grow a privacy team to keep pace with your business. Trust Keith embeds compliance into your daily operations and culture, so it scales seamlessly as you do.",
    features: ['Tailored Policies', 'Smart Policy Management', 'Jargon-free Training', 'Vendor Risk Management', 'DSAR & Incident Management']
  }))), /*#__PURE__*/React.createElement(S.Stats, null), /*#__PURE__*/React.createElement("section", {
    className: "wrap",
    style: {
      padding: '56px 24px'
    }
  }, /*#__PURE__*/React.createElement(Testimonial, {
    featured: true,
    quote: "Trust Keith is the oil in our compliance machine. It makes everything move easier \u2014 it's not adding to my workload, it's actually reducing it.",
    name: "Caitlin O'Connell",
    role: "Senior Business Partner",
    company: "Ocean Bottle"
  })), /*#__PURE__*/React.createElement(S.ProductGrid, null), /*#__PURE__*/React.createElement(S.CtaBand, {
    onCta: open
  }), /*#__PURE__*/React.createElement(S.Footer, null), /*#__PURE__*/React.createElement(ContactModal, {
    open: modal,
    onClose: () => setModal(false)
  }));
}
ReactDOM.createRoot(document.getElementById('root')).render(/*#__PURE__*/React.createElement(App, null));
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/marketing/app.jsx", error: String((e && e.message) || e) }); }

__ds_ns.Avatar = __ds_scope.Avatar;

__ds_ns.Badge = __ds_scope.Badge;

__ds_ns.Button = __ds_scope.Button;

__ds_ns.Card = __ds_scope.Card;

__ds_ns.Checkbox = __ds_scope.Checkbox;

__ds_ns.Input = __ds_scope.Input;

__ds_ns.Logo = __ds_scope.Logo;

__ds_ns.Switch = __ds_scope.Switch;

__ds_ns.FeatureListItem = __ds_scope.FeatureListItem;

__ds_ns.ProgressBar = __ds_scope.ProgressBar;

__ds_ns.StatBlock = __ds_scope.StatBlock;

__ds_ns.Testimonial = __ds_scope.Testimonial;

__ds_ns.NavBar = __ds_scope.NavBar;

})();
