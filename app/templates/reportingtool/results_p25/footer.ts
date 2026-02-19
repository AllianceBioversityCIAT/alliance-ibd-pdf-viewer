/**
 * Self-contained HTML footer for Gotenberg PDF generation.
 * All CSS is inline — no external dependencies (except Google Fonts).
 *
 * Gotenberg replaces these special class names at render time:
 *   .pageNumber  → current page number
 *   .totalPages  → total page count
 */
export const footerHtml = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  @import url('https://fonts.googleapis.com/css2?family=Noto+Sans:wght@400;500&display=swap');
  * { margin: 0; padding: 0; box-sizing: border-box; }
</style>
</head>
<body>
  <div style="font-family: 'Noto Sans', Arial, Helvetica, sans-serif; font-size: 7px; margin: 0; padding: 0 43px; color: #818181;">
    <div style="border-top: 1px solid #e2e0df; padding-top: 6px; display: flex; justify-content: space-between; align-items: center;">
      <span style="color: #065f4a; font-weight: 500;">CGIAR Results Framework</span>
      <span>Page <span class="pageNumber" style="font-weight: 500;"></span> of <span class="totalPages" style="font-weight: 500;"></span></span>
    </div>
  </div>
</body>
</html>`;
