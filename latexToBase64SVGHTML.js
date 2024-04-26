const mjAPI = require("mathjax-node-svg2png");

/**
 * Convert LaTeX code to SVG and then to base64, wrapped in an HTML <img> tag.
 * @param {string} latex - The LaTeX code to be converted.
 * @param {Function} callback - Callback function to handle the result.
 */
function latexToBase64SVGHTML(latex, callback) {
  // Configure MathJax
  mjAPI.config({
    MathJax: {
      SVG: {
        font: "TeX",
        scale: 1,
        exFactor: .5,
        width: 400,
        useGlobalCache: false
      }
    }
  });

  mjAPI.start();

  // Convert LaTeX to SVG
  mjAPI.typeset({
    math: latex,
    format: "TeX",
    svg: true
  }, function (data) {
    if (!data.errors) {
      // Encode SVG as base64
      const base64Data = Buffer.from(data.svg).toString('base64');
      // Create HTML img tag with base64 data
      const imgTag = `<img src="data:image/svg+xml;base64,${base64Data}" />`;
      callback(null, imgTag);
    } else {
      console.error("Error converting LaTeX to SVG:", data.errors);
      callback(data.errors);
    }
  });
}

// Export the method
module.exports.latexToBase64SVGHTML = latexToBase64SVGHTML;
