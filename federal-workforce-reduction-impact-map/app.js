/* global topojson */
/* ===============================================================
   Federal Workforce Reduction Impact Map
   Sources: OPM FedScope (Mar 2025), Census ACS (2023), BLS CES/LAUS
   =============================================================== */

(function () {
  "use strict";

  // ── Theme toggle ──
  const themeBtn = document.querySelector("[data-theme-toggle]");
  const root = document.documentElement;
  let currentTheme = matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  root.setAttribute("data-theme", currentTheme);

  if (themeBtn) {
    themeBtn.addEventListener("click", function () {
      currentTheme = currentTheme === "dark" ? "light" : "dark";
      root.setAttribute("data-theme", currentTheme);
      themeBtn.setAttribute("aria-label", "Switch to " + (currentTheme === "dark" ? "light" : "dark") + " mode");
      themeBtn.innerHTML = currentTheme === "dark"
        ? '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>'
        : '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';
      // Re-render map with new colors
      if (window._mapReady) {
        renderMap(window._currentView);
      }
    });
  }

  // ── State-level data ──
  // Sources: OPM FedScope Mar 2025 & OpenFeds (duty station), BLS CES (total nonfarm),
  // Census ACS 2023 (residence-based), Arizona Economy (state share analysis)
  // fedEmployees = FedScope non-postal civilian employees (duty station)
  // totalEmployment = BLS CES nonfarm (approx.)
  // fedShare = federal share of total employment (%)
  // estLosses = modeled proportional distribution of ~131K total separations
  const stateData = {
    "Alabama":       { abbr: "AL", fedEmployees: 37400, totalEmployment: 2040000, fedShare: 1.8, estLosses: 2100, topAgencies: ["DOD","VA","Army"] },
    "Alaska":        { abbr: "AK", fedEmployees: 10400, totalEmployment: 330000, fedShare: 3.2, estLosses: 590, topAgencies: ["DOI","DOD","FAA"] },
    "Arizona":       { abbr: "AZ", fedEmployees: 38100, totalEmployment: 3040000, fedShare: 1.4, estLosses: 2150, topAgencies: ["DOD","VA","DHS"] },
    "Arkansas":      { abbr: "AR", fedEmployees: 12600, totalEmployment: 1280000, fedShare: 1.0, estLosses: 710, topAgencies: ["VA","USDA","Army"] },
    "California":    { abbr: "CA", fedEmployees: 152500, totalEmployment: 17900000, fedShare: 1.0, estLosses: 8600, topAgencies: ["DOD","VA","DHS"] },
    "Colorado":      { abbr: "CO", fedEmployees: 36800, totalEmployment: 2870000, fedShare: 1.5, estLosses: 2080, topAgencies: ["DOD","DOI","VA"] },
    "Connecticut":   { abbr: "CT", fedEmployees: 8000, totalEmployment: 1730000, fedShare: 0.5, estLosses: 450, topAgencies: ["Navy","VA","IRS"] },
    "Delaware":      { abbr: "DE", fedEmployees: 3000, totalEmployment: 480000, fedShare: 0.7, estLosses: 170, topAgencies: ["VA","Air Force","IRS"] },
    "District of Columbia": { abbr: "DC", fedEmployees: 147600, totalEmployment: 830000, fedShare: 18.5, estLosses: 16300, topAgencies: ["DOJ","DHS","Treasury"] },
    "Florida":       { abbr: "FL", fedEmployees: 89500, totalEmployment: 9900000, fedShare: 1.0, estLosses: 5050, topAgencies: ["DOD","VA","Navy"] },
    "Georgia":       { abbr: "GA", fedEmployees: 71700, totalEmployment: 4780000, fedShare: 1.7, estLosses: 4050, topAgencies: ["DOD","Army","VA"] },
    "Hawaii":        { abbr: "HI", fedEmployees: 23500, totalEmployment: 680000, fedShare: 4.2, estLosses: 1330, topAgencies: ["DOD","Navy","VA"] },
    "Idaho":         { abbr: "ID", fedEmployees: 7700, totalEmployment: 900000, fedShare: 1.0, estLosses: 430, topAgencies: ["DOE","DOI","USDA"] },
    "Illinois":      { abbr: "IL", fedEmployees: 44800, totalEmployment: 6140000, fedShare: 0.8, estLosses: 2530, topAgencies: ["VA","Army","IRS"] },
    "Indiana":       { abbr: "IN", fedEmployees: 22600, totalEmployment: 3180000, fedShare: 0.8, estLosses: 1280, topAgencies: ["DOD","VA","IRS"] },
    "Iowa":          { abbr: "IA", fedEmployees: 8000, totalEmployment: 1620000, fedShare: 0.5, estLosses: 450, topAgencies: ["VA","USDA","IRS"] },
    "Kansas":        { abbr: "KS", fedEmployees: 15700, totalEmployment: 1430000, fedShare: 1.2, estLosses: 890, topAgencies: ["Army","DOD","VA"] },
    "Kentucky":      { abbr: "KY", fedEmployees: 22200, totalEmployment: 1970000, fedShare: 1.2, estLosses: 1250, topAgencies: ["Army","DOD","VA"] },
    "Louisiana":     { abbr: "LA", fedEmployees: 19500, totalEmployment: 1970000, fedShare: 1.1, estLosses: 1100, topAgencies: ["DOD","VA","Navy"] },
    "Maine":         { abbr: "ME", fedEmployees: 11300, totalEmployment: 660000, fedShare: 1.8, estLosses: 640, topAgencies: ["Navy","VA","DOD"] },
    "Maryland":      { abbr: "MD", fedEmployees: 120700, totalEmployment: 2770000, fedShare: 5.3, estLosses: 13000, topAgencies: ["DOD","NIH","SSA"] },
    "Massachusetts": { abbr: "MA", fedEmployees: 25100, totalEmployment: 3770000, fedShare: 0.8, estLosses: 1420, topAgencies: ["VA","DOD","IRS"] },
    "Michigan":      { abbr: "MI", fedEmployees: 27400, totalEmployment: 4430000, fedShare: 0.7, estLosses: 1550, topAgencies: ["VA","DOD","IRS"] },
    "Minnesota":     { abbr: "MN", fedEmployees: 16800, totalEmployment: 3010000, fedShare: 0.6, estLosses: 950, topAgencies: ["VA","USDA","IRS"] },
    "Mississippi":   { abbr: "MS", fedEmployees: 17300, totalEmployment: 1180000, fedShare: 1.6, estLosses: 980, topAgencies: ["DOD","Navy","VA"] },
    "Missouri":      { abbr: "MO", fedEmployees: 33400, totalEmployment: 2900000, fedShare: 1.3, estLosses: 1890, topAgencies: ["DOD","VA","IRS"] },
    "Montana":       { abbr: "MT", fedEmployees: 8600, totalEmployment: 530000, fedShare: 1.8, estLosses: 490, topAgencies: ["DOI","USDA","VA"] },
    "Nebraska":      { abbr: "NE", fedEmployees: 10500, totalEmployment: 1030000, fedShare: 1.1, estLosses: 590, topAgencies: ["Air Force","DOD","VA"] },
    "Nevada":        { abbr: "NV", fedEmployees: 12200, totalEmployment: 1480000, fedShare: 0.9, estLosses: 690, topAgencies: ["DOD","DOE","VA"] },
    "New Hampshire": { abbr: "NH", fedEmployees: 4300, totalEmployment: 720000, fedShare: 0.6, estLosses: 240, topAgencies: ["DOD","VA","IRS"] },
    "New Jersey":    { abbr: "NJ", fedEmployees: 24800, totalEmployment: 4250000, fedShare: 0.6, estLosses: 1400, topAgencies: ["DOD","VA","DHS"] },
    "New Mexico":    { abbr: "NM", fedEmployees: 22000, totalEmployment: 870000, fedShare: 4.8, estLosses: 1240, topAgencies: ["DOE","DOD","DOI"] },
    "New York":      { abbr: "NY", fedEmployees: 60700, totalEmployment: 9700000, fedShare: 0.7, estLosses: 3430, topAgencies: ["VA","DHS","DOD"] },
    "North Carolina":{ abbr: "NC", fedEmployees: 42800, totalEmployment: 4710000, fedShare: 1.0, estLosses: 2420, topAgencies: ["DOD","Army","VA"] },
    "North Dakota":  { abbr: "ND", fedEmployees: 5500, totalEmployment: 440000, fedShare: 1.3, estLosses: 310, topAgencies: ["Air Force","DOD","VA"] },
    "Ohio":          { abbr: "OH", fedEmployees: 49500, totalEmployment: 5590000, fedShare: 1.0, estLosses: 2790, topAgencies: ["DOD","VA","Air Force"] },
    "Oklahoma":      { abbr: "OK", fedEmployees: 37500, totalEmployment: 1730000, fedShare: 2.4, estLosses: 2120, topAgencies: ["DOD","Army","FAA"] },
    "Oregon":        { abbr: "OR", fedEmployees: 17300, totalEmployment: 1960000, fedShare: 1.0, estLosses: 980, topAgencies: ["USDA","VA","DOI"] },
    "Pennsylvania":  { abbr: "PA", fedEmployees: 62400, totalEmployment: 6050000, fedShare: 1.1, estLosses: 3520, topAgencies: ["DOD","VA","IRS"] },
    "Rhode Island":  { abbr: "RI", fedEmployees: 6900, totalEmployment: 520000, fedShare: 1.4, estLosses: 390, topAgencies: ["Navy","VA","DOD"] },
    "South Carolina":{ abbr: "SC", fedEmployees: 21100, totalEmployment: 2250000, fedShare: 1.0, estLosses: 1190, topAgencies: ["DOD","Army","VA"] },
    "South Dakota":  { abbr: "SD", fedEmployees: 7500, totalEmployment: 460000, fedShare: 1.8, estLosses: 420, topAgencies: ["VA","DOI","USDA"] },
    "Tennessee":     { abbr: "TN", fedEmployees: 25100, totalEmployment: 3150000, fedShare: 0.9, estLosses: 1420, topAgencies: ["DOE","VA","DOD"] },
    "Texas":         { abbr: "TX", fedEmployees: 133000, totalEmployment: 13700000, fedShare: 1.1, estLosses: 7500, topAgencies: ["DOD","VA","Army"] },
    "Utah":          { abbr: "UT", fedEmployees: 26100, totalEmployment: 1680000, fedShare: 1.8, estLosses: 1470, topAgencies: ["DOD","IRS","DOI"] },
    "Vermont":       { abbr: "VT", fedEmployees: 4800, totalEmployment: 330000, fedShare: 1.5, estLosses: 270, topAgencies: ["VA","USDA","DOD"] },
    "Virginia":      { abbr: "VA", fedEmployees: 144300, totalEmployment: 4130000, fedShare: 4.1, estLosses: 15600, topAgencies: ["DOD","Navy","Army"] },
    "Washington":    { abbr: "WA", fedEmployees: 53200, totalEmployment: 3590000, fedShare: 1.7, estLosses: 3000, topAgencies: ["DOD","Army","VA"] },
    "West Virginia": { abbr: "WV", fedEmployees: 18700, totalEmployment: 740000, fedShare: 2.7, estLosses: 1060, topAgencies: ["VA","FBI","IRS"] },
    "Wisconsin":     { abbr: "WI", fedEmployees: 14000, totalEmployment: 2980000, fedShare: 0.5, estLosses: 790, topAgencies: ["VA","USDA","IRS"] },
    "Wyoming":       { abbr: "WY", fedEmployees: 5000, totalEmployment: 280000, fedShare: 2.0, estLosses: 280, topAgencies: ["DOI","USDA","VA"] }
  };

  // ── Metro area data ──
  // Sources: OPM FedScope (duty station), BLS CES metro area, Census ACS 2023,
  // EPI federal workers tool, Urban Institute analysis, BLS metro employment reports
  const metroData = [
    { name: "Washington-Arlington-Alexandria, DC-VA-MD-WV", lat: 38.9, lon: -77.04, fedEmployees: 282700, totalEmployment: 3394000, fedShare: 8.3, estLosses: 31200, risk: "critical" },
    { name: "San Antonio-New Braunfels, TX", lat: 29.42, lon: -98.49, fedEmployees: 42000, totalEmployment: 1090000, fedShare: 3.9, estLosses: 4600, risk: "high" },
    { name: "Virginia Beach-Norfolk-Newport News, VA-NC", lat: 36.85, lon: -75.98, fedEmployees: 55000, totalEmployment: 810000, fedShare: 6.8, estLosses: 6100, risk: "critical" },
    { name: "San Diego-Chula Vista-Carlsbad, CA", lat: 32.72, lon: -117.16, fedEmployees: 36000, totalEmployment: 1510000, fedShare: 2.4, estLosses: 4000, risk: "high" },
    { name: "Honolulu, HI", lat: 21.31, lon: -157.86, fedEmployees: 23000, totalEmployment: 480000, fedShare: 4.8, estLosses: 2500, risk: "critical" },
    { name: "Colorado Springs, CO", lat: 38.83, lon: -104.82, fedEmployees: 18500, totalEmployment: 310000, fedShare: 6.0, estLosses: 2000, risk: "critical" },
    { name: "Fayetteville, NC", lat: 35.05, lon: -78.88, fedEmployees: 16000, totalEmployment: 155000, fedShare: 10.3, estLosses: 1800, risk: "critical" },
    { name: "Killeen-Temple, TX", lat: 31.12, lon: -97.73, fedEmployees: 14500, totalEmployment: 155000, fedShare: 9.4, estLosses: 1600, risk: "critical" },
    { name: "Huntsville, AL", lat: 34.73, lon: -86.59, fedEmployees: 16200, totalEmployment: 260000, fedShare: 6.2, estLosses: 1800, risk: "critical" },
    { name: "Augusta-Richmond County, GA-SC", lat: 33.47, lon: -81.97, fedEmployees: 11500, totalEmployment: 235000, fedShare: 4.9, estLosses: 1300, risk: "high" },
    { name: "Baltimore-Columbia-Towson, MD", lat: 39.28, lon: -76.62, fedEmployees: 56000, totalEmployment: 1440000, fedShare: 3.9, estLosses: 6200, risk: "high" },
    { name: "Sacramento-Roseville-Folsom, CA", lat: 38.58, lon: -121.49, fedEmployees: 18000, totalEmployment: 1050000, fedShare: 1.7, estLosses: 2000, risk: "moderate" },
    { name: "Oklahoma City, OK", lat: 35.47, lon: -97.52, fedEmployees: 22000, totalEmployment: 640000, fedShare: 3.4, estLosses: 2400, risk: "high" },
    { name: "Clarksville, TN-KY", lat: 36.53, lon: -87.36, fedEmployees: 7500, totalEmployment: 95000, fedShare: 7.9, estLosses: 830, risk: "critical" },
    { name: "Anchorage, AK", lat: 61.22, lon: -149.90, fedEmployees: 7200, totalEmployment: 190000, fedShare: 3.8, estLosses: 800, risk: "high" },
    { name: "Columbia, SC", lat: 34.0, lon: -81.03, fedEmployees: 8200, totalEmployment: 400000, fedShare: 2.1, estLosses: 900, risk: "moderate" },
    { name: "El Paso, TX", lat: 31.76, lon: -106.44, fedEmployees: 10500, totalEmployment: 320000, fedShare: 3.3, estLosses: 1200, risk: "high" },
    { name: "Albuquerque, NM", lat: 35.08, lon: -106.65, fedEmployees: 13500, totalEmployment: 400000, fedShare: 3.4, estLosses: 1500, risk: "high" },
    { name: "Jacksonville, FL", lat: 30.33, lon: -81.66, fedEmployees: 16000, totalEmployment: 770000, fedShare: 2.1, estLosses: 1800, risk: "moderate" },
    { name: "Fort Leonard Wood, MO", lat: 37.71, lon: -92.13, fedEmployees: 3000, totalEmployment: 15000, fedShare: 20.0, estLosses: 330, risk: "critical" },
    { name: "Philadelphia-Camden-Wilmington, PA-NJ-DE-MD", lat: 39.95, lon: -75.17, fedEmployees: 39000, totalEmployment: 2990000, fedShare: 1.3, estLosses: 4300, risk: "moderate" },
    { name: "Atlanta-Sandy Springs-Alpharetta, GA", lat: 33.75, lon: -84.39, fedEmployees: 38000, totalEmployment: 2900000, fedShare: 1.3, estLosses: 4200, risk: "moderate" },
    { name: "Kansas City, MO-KS", lat: 39.10, lon: -94.58, fedEmployees: 16000, totalEmployment: 1080000, fedShare: 1.5, estLosses: 1800, risk: "moderate" },
    { name: "Denver-Aurora-Lakewood, CO", lat: 39.74, lon: -104.99, fedEmployees: 23000, totalEmployment: 1580000, fedShare: 1.5, estLosses: 2500, risk: "moderate" },
    { name: "St. Louis, MO-IL", lat: 38.63, lon: -90.20, fedEmployees: 16500, totalEmployment: 1380000, fedShare: 1.2, estLosses: 1800, risk: "moderate" },
    { name: "Pittsburgh, PA", lat: 40.44, lon: -79.99, fedEmployees: 13000, totalEmployment: 1180000, fedShare: 1.1, estLosses: 1400, risk: "moderate" },
    { name: "Hampton Roads (military), VA", lat: 37.04, lon: -76.37, fedEmployees: 48000, totalEmployment: 790000, fedShare: 6.1, estLosses: 5300, risk: "critical" }
  ];

  // ── Agency reductions data ──
  const agencyData = [
    { name: "Dept. of Defense (civilian)", cuts: 55000, total: 880000 },
    { name: "Internal Revenue Service", cuts: 30000, total: 90000 },
    { name: "Dept. of Agriculture", cuts: 21000, total: 96000 },
    { name: "Health & Human Services", cuts: 13450, total: 82000 },
    { name: "Dept. of Interior", cuts: 9700, total: 67000 },
    { name: "Dept. of Energy", cuts: 4970, total: 15000 },
    { name: "Dept. of Transportation", cuts: 4915, total: 55000 },
    { name: "NASA", cuts: 4890, total: 18000 },
    { name: "Housing & Urban Dev.", cuts: 4000, total: 8000 },
    { name: "Soc. Security Admin.", cuts: 7000, total: 58000 },
    { name: "FDA", cuts: 3500, total: 18000 },
    { name: "Consumer Fin. Protection", cuts: 1500, total: 1740 }
  ];

  // ── Map color scales ──
  function getMapColors() {
    var style = getComputedStyle(document.documentElement);
    return [
      style.getPropertyValue("--map-0").trim() || "#1a1d28",
      style.getPropertyValue("--map-1").trim() || "#1e2a3d",
      style.getPropertyValue("--map-2").trim() || "#1f3652",
      style.getPropertyValue("--map-3").trim() || "#204368",
      style.getPropertyValue("--map-4").trim() || "#225080",
      style.getPropertyValue("--map-5").trim() || "#2a6399",
      style.getPropertyValue("--map-6").trim() || "#3578b2",
      style.getPropertyValue("--map-7").trim() || "#4a8ec6",
      style.getPropertyValue("--map-8").trim() || "#6aa5d8",
      style.getPropertyValue("--map-9").trim() || "#91bfe6"
    ];
  }

  // ── Build agency bars ──
  function buildAgencyBars() {
    var container = document.getElementById("agency-bars");
    var maxCuts = agencyData[0].cuts;
    var html = "";
    agencyData.forEach(function (a) {
      var pct = ((a.cuts / maxCuts) * 100).toFixed(1);
      html += '<div class="agency-row">'
        + '<div class="agency-row-header">'
        + '<span class="agency-name">' + a.name + '</span>'
        + '<span class="agency-count">-' + a.cuts.toLocaleString() + '</span>'
        + '</div>'
        + '<div class="agency-bar-track"><div class="agency-bar-fill" style="width:' + pct + '%"></div></div>'
        + '</div>';
    });
    container.innerHTML = html;
  }

  // ── Build metros table ──
  function buildMetrosTable() {
    var sorted = metroData.slice().sort(function (a, b) { return b.fedShare - a.fedShare; });
    var tbody = document.querySelector("#metros-table tbody");
    var html = "";
    sorted.forEach(function (m) {
      var riskClass = m.risk;
      var riskLabel = m.risk.charAt(0).toUpperCase() + m.risk.slice(1);
      html += '<tr>'
        + '<td>' + m.name + '</td>'
        + '<td>' + m.fedEmployees.toLocaleString() + '</td>'
        + '<td><strong>' + m.fedShare.toFixed(1) + '%</strong></td>'
        + '<td style="color:var(--color-danger)">-' + m.estLosses.toLocaleString() + '</td>'
        + '<td><span class="risk-badge ' + riskClass + '">' + riskLabel + '</span></td>'
        + '</tr>';
    });
    tbody.innerHTML = html;
  }

  // ── Tooltip ──
  var tooltip = document.getElementById("tooltip");

  function showTooltip(evt, content) {
    tooltip.innerHTML = content;
    tooltip.classList.add("visible");
    positionTooltip(evt);
  }

  function positionTooltip(evt) {
    var x = evt.clientX + 14;
    var y = evt.clientY - 10;
    var tw = tooltip.offsetWidth;
    var th = tooltip.offsetHeight;
    if (x + tw > window.innerWidth - 20) { x = evt.clientX - tw - 14; }
    if (y + th > window.innerHeight - 20) { y = evt.clientY - th - 10; }
    if (y < 10) { y = 10; }
    tooltip.style.left = x + "px";
    tooltip.style.top = y + "px";
  }

  function hideTooltip() {
    tooltip.classList.remove("visible");
  }

  // ── State detail panel ──
  function showStateDetail(stateName) {
    var d = stateData[stateName];
    if (!d) return;
    var panel = document.getElementById("state-detail");
    var spillover = Math.round(d.estLosses * 2.6);
    panel.innerHTML = '<h3>' + stateName + ' (' + d.abbr + ')</h3>'
      + '<div class="detail-stat-grid">'
      + '<div class="detail-stat"><span class="detail-stat-value">' + d.fedEmployees.toLocaleString() + '</span><span class="detail-stat-label">Federal Civilian Employees</span></div>'
      + '<div class="detail-stat"><span class="detail-stat-value">' + d.fedShare.toFixed(1) + '%</span><span class="detail-stat-label">Share of State Workforce</span></div>'
      + '<div class="detail-stat"><span class="detail-stat-value danger">-' + d.estLosses.toLocaleString() + '</span><span class="detail-stat-label">Est. Direct Job Losses</span></div>'
      + '<div class="detail-stat"><span class="detail-stat-value danger">-' + spillover.toLocaleString() + '</span><span class="detail-stat-label">Est. Total Impact (2.6x)</span></div>'
      + '</div>'
      + '<div style="margin-top:var(--space-4);font-size:var(--text-xs);color:var(--color-text-muted)">Top agencies: ' + d.topAgencies.join(", ") + '</div>';
  }

  // ── Load US topology & render map ──
  var usTopoUrl = "https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json";
  var mapSvg, projection, path, gStates, gMetros, gLabels;

  function initMap(us) {
    var container = document.getElementById("map");
    var w = container.clientWidth;
    var h = container.clientHeight;

    mapSvg = d3.select("#map").append("svg")
      .attr("viewBox", "0 0 " + w + " " + h)
      .attr("preserveAspectRatio", "xMidYMid meet");

    projection = d3.geoAlbersUsa()
      .fitSize([w - 40, h - 40], topojson.feature(us, us.objects.states))
      .translate([w / 2, h / 2]);

    path = d3.geoPath().projection(projection);

    gStates = mapSvg.append("g").attr("class", "states-layer");
    gMetros = mapSvg.append("g").attr("class", "metros-layer");
    gLabels = mapSvg.append("g").attr("class", "labels-layer");

    var statesFeature = topojson.feature(us, us.objects.states).features;

    // State abbreviation mapping by FIPS
    var fipsToState = {
      "01": "Alabama", "02": "Alaska", "04": "Arizona", "05": "Arkansas",
      "06": "California", "08": "Colorado", "09": "Connecticut", "10": "Delaware",
      "11": "District of Columbia", "12": "Florida", "13": "Georgia", "15": "Hawaii",
      "16": "Idaho", "17": "Illinois", "18": "Indiana", "19": "Iowa",
      "20": "Kansas", "21": "Kentucky", "22": "Louisiana", "23": "Maine",
      "24": "Maryland", "25": "Massachusetts", "26": "Michigan", "27": "Minnesota",
      "28": "Mississippi", "29": "Missouri", "30": "Montana", "31": "Nebraska",
      "32": "Nevada", "33": "New Hampshire", "34": "New Jersey", "35": "New Mexico",
      "36": "New York", "37": "North Carolina", "38": "North Dakota", "39": "Ohio",
      "40": "Oklahoma", "41": "Oregon", "42": "Pennsylvania", "44": "Rhode Island",
      "45": "South Carolina", "46": "South Dakota", "47": "Tennessee", "48": "Texas",
      "49": "Utah", "50": "Vermont", "51": "Virginia", "53": "Washington",
      "54": "West Virginia", "55": "Wisconsin", "56": "Wyoming"
    };

    // Draw states
    gStates.selectAll("path")
      .data(statesFeature)
      .join("path")
      .attr("class", "state-path")
      .attr("d", path)
      .attr("data-state", function (d) {
        var fips = String(d.id).padStart(2, "0");
        return fipsToState[fips] || "";
      })
      .on("mouseover", function (evt, d) {
        var fips = String(d.id).padStart(2, "0");
        var stateName = fipsToState[fips];
        var sd = stateData[stateName];
        if (!sd) return;
        var html = '<div class="tooltip-name">' + stateName + '</div>'
          + '<div class="tooltip-row"><span class="tooltip-label">Federal Employees</span><span class="tooltip-value">' + sd.fedEmployees.toLocaleString() + '</span></div>'
          + '<div class="tooltip-row"><span class="tooltip-label">Fed Share of Jobs</span><span class="tooltip-value">' + sd.fedShare.toFixed(1) + '%</span></div>'
          + '<div class="tooltip-row"><span class="tooltip-label">Est. Direct Losses</span><span class="tooltip-value danger">-' + sd.estLosses.toLocaleString() + '</span></div>'
          + '<div class="tooltip-row"><span class="tooltip-label">Top Agencies</span><span class="tooltip-value">' + sd.topAgencies.join(", ") + '</span></div>'
          + '<div class="tooltip-bar"><div class="tooltip-bar-fill" style="width:' + Math.min(sd.fedShare / 18.5 * 100, 100).toFixed(0) + '%;background:var(--color-primary)"></div></div>';
        showTooltip(evt, html);
      })
      .on("mousemove", function (evt) { positionTooltip(evt); })
      .on("mouseout", function () { hideTooltip(); })
      .on("click", function (evt, d) {
        var fips = String(d.id).padStart(2, "0");
        var stateName = fipsToState[fips];
        d3.selectAll(".state-path").classed("active", false);
        d3.select(this).classed("active", true);
        showStateDetail(stateName);
      });

    // State labels
    gLabels.selectAll("text")
      .data(statesFeature)
      .join("text")
      .attr("class", "state-label")
      .attr("x", function (d) { var c = path.centroid(d); return c[0]; })
      .attr("y", function (d) { var c = path.centroid(d); return c[1]; })
      .text(function (d) {
        var fips = String(d.id).padStart(2, "0");
        var sn = fipsToState[fips];
        return sn && stateData[sn] ? stateData[sn].abbr : "";
      });

    // Metro dots
    gMetros.selectAll("circle")
      .data(metroData.filter(function (m) {
        var p = projection([m.lon, m.lat]);
        return p !== null;
      }))
      .join("circle")
      .attr("class", "metro-dot")
      .attr("cx", function (d) { var p = projection([d.lon, d.lat]); return p ? p[0] : 0; })
      .attr("cy", function (d) { var p = projection([d.lon, d.lat]); return p ? p[1] : 0; })
      .attr("r", function (d) { return Math.max(3, Math.sqrt(d.fedEmployees / 1200)); })
      .on("mouseover", function (evt, d) {
        var html = '<div class="tooltip-name">' + d.name + '</div>'
          + '<div class="tooltip-row"><span class="tooltip-label">Federal Employees</span><span class="tooltip-value">' + d.fedEmployees.toLocaleString() + '</span></div>'
          + '<div class="tooltip-row"><span class="tooltip-label">Fed Share of Jobs</span><span class="tooltip-value">' + d.fedShare.toFixed(1) + '%</span></div>'
          + '<div class="tooltip-row"><span class="tooltip-label">Est. Direct Losses</span><span class="tooltip-value danger">-' + d.estLosses.toLocaleString() + '</span></div>'
          + '<div class="tooltip-row"><span class="tooltip-label">Risk Level</span><span class="tooltip-value">' + d.risk.toUpperCase() + '</span></div>'
          + '<div class="tooltip-bar"><div class="tooltip-bar-fill" style="width:' + Math.min(d.fedShare / 20 * 100, 100).toFixed(0) + '%;background:var(--color-danger)"></div></div>';
        showTooltip(evt, html);
      })
      .on("mousemove", function (evt) { positionTooltip(evt); })
      .on("mouseout", function () { hideTooltip(); });

    window._mapReady = true;
    window._currentView = "employment";
    renderMap("employment");
  }

  function renderMap(view) {
    window._currentView = view;
    var colors = getMapColors();
    var colorScale;

    if (view === "employment") {
      colorScale = d3.scaleQuantize()
        .domain([0.5, 18.5])
        .range(colors);
      gStates.selectAll(".state-path")
        .transition().duration(500)
        .attr("fill", function (el) {
          var sn = d3.select(this).attr("data-state");
          var sd = stateData[sn];
          return sd ? colorScale(sd.fedShare) : colors[0];
        });
      updateLegend("Federal Employment Share (%)", "0.5%", "18.5%", colors);
    } else if (view === "impact") {
      colorScale = d3.scaleQuantize()
        .domain([0, 16300])
        .range(colors);
      gStates.selectAll(".state-path")
        .transition().duration(500)
        .attr("fill", function () {
          var sn = d3.select(this).attr("data-state");
          var sd = stateData[sn];
          return sd ? colorScale(sd.estLosses) : colors[0];
        });
      updateLegend("Estimated Direct Job Losses", "0", "16,300", colors);
    } else if (view === "agencies") {
      // Color by number of top agencies that are heavily cut
      var heavilyCut = ["DOD", "IRS", "VA", "USDA", "HHS", "DOI", "DOE"];
      colorScale = d3.scaleQuantize()
        .domain([0, 3])
        .range(colors);
      gStates.selectAll(".state-path")
        .transition().duration(500)
        .attr("fill", function () {
          var sn = d3.select(this).attr("data-state");
          var sd = stateData[sn];
          if (!sd) return colors[0];
          var count = sd.topAgencies.filter(function (a) { return heavilyCut.indexOf(a) >= 0; }).length;
          return colorScale(count);
        });
      updateLegend("Exposure to Heavily-Cut Agencies", "Low", "High", colors);
    }
  }

  function updateLegend(title, labelLow, labelHigh, colors) {
    var legend = document.getElementById("legend");
    var blocks = "";
    colors.forEach(function (c) {
      blocks += '<div class="legend-block" style="background:' + c + '"></div>';
    });
    legend.innerHTML = '<div class="legend-title">' + title + '</div>'
      + '<div class="legend-scale">' + blocks + '</div>'
      + '<div class="legend-labels"><span>' + labelLow + '</span><span>' + labelHigh + '</span></div>';
  }

  // ── View toggles ──
  document.querySelectorAll(".toggle-btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
      document.querySelectorAll(".toggle-btn").forEach(function (b) { b.classList.remove("active"); });
      btn.classList.add("active");
      renderMap(btn.getAttribute("data-view"));
    });
  });

  // ── Init ──
  buildAgencyBars();
  buildMetrosTable();

  d3.json(usTopoUrl).then(function (us) {
    initMap(us);
  }).catch(function (err) {
    document.getElementById("map").innerHTML = '<div style="padding:2rem;text-align:center;color:var(--color-text-muted)">Error loading map data. Please refresh.</div>';
  });
})();
