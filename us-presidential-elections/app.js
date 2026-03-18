/* ===== US Presidential Election Map ===== */
/* global ELECTION_DATA, topojson */
(function () {
  "use strict";

  // ===== STATE NAME MAPPINGS =====
  const STATE_FIPS = {
    "01":"AL","02":"AK","04":"AZ","05":"AR","06":"CA","08":"CO","09":"CT","10":"DE",
    "11":"DC","12":"FL","13":"GA","15":"HI","16":"ID","17":"IL","18":"IN","19":"IA",
    "20":"KS","21":"KY","22":"LA","23":"ME","24":"MD","25":"MA","26":"MI","27":"MN",
    "28":"MS","29":"MO","30":"MT","31":"NE","32":"NV","33":"NH","34":"NJ","35":"NM",
    "36":"NY","37":"NC","38":"ND","39":"OH","40":"OK","41":"OR","42":"PA","44":"RI",
    "45":"SC","46":"SD","47":"TN","48":"TX","49":"UT","50":"VT","51":"VA","53":"WA",
    "54":"WV","55":"WI","56":"WY"
  };

  const STATE_NAMES = {
    AL:"Alabama",AK:"Alaska",AZ:"Arizona",AR:"Arkansas",CA:"California",
    CO:"Colorado",CT:"Connecticut",DE:"Delaware",DC:"District of Columbia",
    FL:"Florida",GA:"Georgia",HI:"Hawaii",ID:"Idaho",IL:"Illinois",IN:"Indiana",
    IA:"Iowa",KS:"Kansas",KY:"Kentucky",LA:"Louisiana",ME:"Maine",MD:"Maryland",
    MA:"Massachusetts",MI:"Michigan",MN:"Minnesota",MS:"Mississippi",MO:"Missouri",
    MT:"Montana",NE:"Nebraska",NV:"Nevada",NH:"New Hampshire",NJ:"New Jersey",
    NM:"New Mexico",NY:"New York",NC:"North Carolina",ND:"North Dakota",OH:"Ohio",
    OK:"Oklahoma",OR:"Oregon",PA:"Pennsylvania",RI:"Rhode Island",SC:"South Carolina",
    SD:"South Dakota",TN:"Tennessee",TX:"Texas",UT:"Utah",VT:"Vermont",VA:"Virginia",
    WA:"Washington",WV:"West Virginia",WI:"Wisconsin",WY:"Wyoming"
  };

  // ===== APP STATE =====
  const electionYears = Object.keys(ELECTION_DATA.elections).sort((a, b) => +a - +b);
  let currentYearIndex = 0;
  let isPlaying = false;
  let playInterval = null;
  let showSwingStates = false;
  let showCounties = false;
  let statesGeo = null;
  let countiesGeo = null;
  let statesMesh = null;
  let projection = null;
  let pathGen = null;
  let svg = null;
  let mapGroup = null;
  let width = 960;
  let height = 600;

  // ===== PARTY COLORS (dynamic for theme) =====
  function getPartyColor(party) {
    const colors = ELECTION_DATA.partyColors;
    if (colors[party]) return colors[party];
    // Fallback grouping
    if (party && party.toLowerCase().includes("democrat")) return colors["Democratic"];
    if (party && party.toLowerCase().includes("republic")) return colors["Republican"];
    if (party && party.toLowerCase().includes("whig")) return colors["Whig"];
    if (party && party.toLowerCase().includes("federalist")) return colors["Federalist"];
    return "#888888";
  }

  // ===== INITIALIZATION =====
  async function init() {
    // Load geo data
    const [statesData, countiesData] = await Promise.all([
      d3.json("./assets/states-10m.json"),
      d3.json("./assets/counties-10m.json")
    ]);

    statesGeo = topojson.feature(statesData, statesData.objects.states);
    countiesGeo = topojson.feature(countiesData, countiesData.objects.counties);
    statesMesh = topojson.mesh(statesData, statesData.objects.states, (a, b) => a !== b);

    setupMap();
    setupControls();
    setupThemeToggle();
    renderElection();
    handleResize();
    window.addEventListener("resize", handleResize);
  }

  // ===== MAP SETUP =====
  function setupMap() {
    const container = document.getElementById("map-container");
    svg = d3.select("#map-svg");

    updateDimensions();

    projection = d3.geoAlbersUsa()
      .fitSize([width, height], statesGeo);

    pathGen = d3.path ? d3.geoPath(projection) : d3.geoPath().projection(projection);
    pathGen = d3.geoPath().projection(projection);

    mapGroup = svg.append("g").attr("class", "map-group");
  }

  function updateDimensions() {
    const container = document.getElementById("map-container");
    const rect = container.getBoundingClientRect();
    width = rect.width || 960;
    height = rect.height || 600;
    svg.attr("viewBox", `0 0 ${width} ${height}`);

    if (projection) {
      projection.fitSize([width - 40, height - 20], statesGeo);
      pathGen = d3.geoPath().projection(projection);
    }
  }

  function handleResize() {
    updateDimensions();
    renderMap();
  }

  // ===== CONTROLS =====
  function setupControls() {
    const slider = document.getElementById("year-slider");
    const prevBtn = document.getElementById("prev-year");
    const nextBtn = document.getElementById("next-year");
    const playBtn = document.getElementById("play-btn");
    const swingBtn = document.getElementById("swing-btn");
    const countyBtn = document.getElementById("county-btn");
    const backBtn = document.getElementById("back-to-states");

    slider.max = electionYears.length - 1;
    slider.value = 0;

    slider.addEventListener("input", function () {
      currentYearIndex = parseInt(this.value);
      renderElection();
    });

    prevBtn.addEventListener("click", function () {
      if (currentYearIndex > 0) {
        currentYearIndex--;
        slider.value = currentYearIndex;
        renderElection();
      }
    });

    nextBtn.addEventListener("click", function () {
      if (currentYearIndex < electionYears.length - 1) {
        currentYearIndex++;
        slider.value = currentYearIndex;
        renderElection();
      }
    });

    playBtn.addEventListener("click", togglePlay);

    swingBtn.addEventListener("click", function () {
      showSwingStates = !showSwingStates;
      swingBtn.classList.toggle("active", showSwingStates);
      renderMap();
    });

    countyBtn.addEventListener("click", function () {
      showCounties = !showCounties;
      countyBtn.classList.toggle("active", showCounties);
      backBtn.style.display = showCounties ? "flex" : "none";
      renderMap();
    });

    backBtn.addEventListener("click", function () {
      showCounties = false;
      countyBtn.classList.remove("active");
      backBtn.style.display = "none";
      renderMap();
    });

    // Keyboard navigation
    document.addEventListener("keydown", function (e) {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        if (currentYearIndex > 0) {
          currentYearIndex--;
          slider.value = currentYearIndex;
          renderElection();
        }
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        if (currentYearIndex < electionYears.length - 1) {
          currentYearIndex++;
          slider.value = currentYearIndex;
          renderElection();
        }
      } else if (e.key === " ") {
        e.preventDefault();
        togglePlay();
      }
    });
  }

  function togglePlay() {
    const playBtn = document.getElementById("play-btn");
    isPlaying = !isPlaying;
    
    if (isPlaying) {
      playBtn.classList.add("playing");
      playBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg><span class="btn-text">Pause</span>';
      
      // Start from beginning if at end
      if (currentYearIndex >= electionYears.length - 1) {
        currentYearIndex = 0;
      }
      
      playInterval = setInterval(function () {
        if (currentYearIndex < electionYears.length - 1) {
          currentYearIndex++;
          document.getElementById("year-slider").value = currentYearIndex;
          renderElection();
        } else {
          togglePlay(); // Stop at end
        }
      }, 1500);
    } else {
      playBtn.classList.remove("playing");
      playBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><polygon points="5,3 19,12 5,21"/></svg><span class="btn-text">Play</span>';
      clearInterval(playInterval);
      playInterval = null;
    }
  }

  // ===== THEME TOGGLE =====
  function setupThemeToggle() {
    const toggle = document.querySelector("[data-theme-toggle]");
    const root = document.documentElement;
    let currentTheme = root.getAttribute("data-theme") || 
      (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    root.setAttribute("data-theme", currentTheme);
    updateToggleIcon(toggle, currentTheme);

    toggle.addEventListener("click", function () {
      currentTheme = currentTheme === "dark" ? "light" : "dark";
      root.setAttribute("data-theme", currentTheme);
      updateToggleIcon(toggle, currentTheme);
      // Re-render to update map colors
      renderMap();
    });
  }

  function updateToggleIcon(btn, theme) {
    btn.setAttribute("aria-label", "Switch to " + (theme === "dark" ? "light" : "dark") + " mode");
    btn.innerHTML = theme === "dark"
      ? '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>'
      : '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';
  }

  // ===== RENDER ELECTION =====
  function renderElection() {
    const year = electionYears[currentYearIndex];
    const election = ELECTION_DATA.elections[year];
    if (!election) return;

    document.getElementById("current-year").textContent = year;

    // Show/hide county button
    const countyBtn = document.getElementById("county-btn");
    countyBtn.style.display = election.hasCountyData ? "flex" : "none";
    if (!election.hasCountyData && showCounties) {
      showCounties = false;
      countyBtn.classList.remove("active");
      document.getElementById("back-to-states").style.display = "none";
    }

    updateSidebar(election, year);
    renderMap();
    updateLegend(election);
  }

  // ===== SIDEBAR UPDATE =====
  function updateSidebar(election, year) {
    // Winner info
    document.getElementById("winner-name").textContent = election.winner;
    
    const partyEl = document.getElementById("winner-party");
    partyEl.textContent = election.winnerParty;
    partyEl.style.color = getPartyColor(election.winnerParty);

    const badge = document.getElementById("winner-badge");
    badge.style.background = getPartyColor(election.winnerParty);

    // Winner initials in portrait
    const portrait = document.getElementById("winner-portrait");
    const initials = election.winner.split(" ").map(n => n[0]).join("");
    portrait.style.setProperty("--initials", `"${initials}"`);
    // Add initials via pseudo-element or text
    const existingText = portrait.querySelector(".portrait-initials");
    if (existingText) existingText.textContent = initials;
    else {
      const span = document.createElement("span");
      span.className = "portrait-initials";
      span.style.cssText = "font-size:18px;font-weight:700;color:var(--color-text-muted);";
      span.textContent = initials;
      portrait.insertBefore(span, portrait.firstChild);
    }

    // Stats
    document.getElementById("stat-ev").textContent = 
      `${election.electoralVotesWinner} / ${election.totalElectoralVotes}`;
    
    if (election.popularVotePctWinner) {
      document.getElementById("stat-pv").textContent = 
        `${election.popularVotePctWinner.toFixed(1)}%`;
    } else {
      document.getElementById("stat-pv").textContent = "—";
    }

    // States won count
    const states = election.states || {};
    const stateCount = Object.keys(states).length;
    const winnerStates = Object.values(states).filter(s => {
      const sp = s.party;
      return sp === election.winnerParty || 
        (sp && election.winnerParty && sp.includes(election.winnerParty.split(" ")[0]));
    }).length;
    document.getElementById("stat-states").textContent = `${winnerStates} / ${stateCount}`;

    // Electoral College Bar
    const totalEV = election.totalElectoralVotes || 1;
    const winnerPct = (election.electoralVotesWinner / totalEV * 100);
    const runnerUpPct = (election.electoralVotesRunnerUp / totalEV * 100);
    const thirdPct = Math.max(0, 100 - winnerPct - runnerUpPct);

    const winnerBar = document.getElementById("ec-bar-winner");
    const otherBar = document.getElementById("ec-bar-other");
    const thirdBar = document.getElementById("ec-bar-third");

    winnerBar.style.width = winnerPct + "%";
    winnerBar.style.background = getPartyColor(election.winnerParty);
    winnerBar.textContent = winnerPct > 12 ? election.electoralVotesWinner : "";

    otherBar.style.width = runnerUpPct + "%";
    otherBar.style.background = getPartyColor(election.runnerUpParty);
    otherBar.textContent = runnerUpPct > 12 ? election.electoralVotesRunnerUp : "";

    thirdBar.style.width = thirdPct + "%";
    thirdBar.style.background = "#888";
    thirdBar.textContent = "";

    // EC labels
    document.getElementById("ec-label-winner").textContent = election.winner.split(" ").pop();
    document.getElementById("ec-label-needed").textContent = `${Math.floor(totalEV / 2) + 1} to win`;
    document.getElementById("ec-label-other").textContent = election.runnerUp ? election.runnerUp.split(" ").pop() : "";

    // EC Candidates
    const candidatesEl = document.getElementById("ec-candidates");
    candidatesEl.innerHTML = "";

    const addCandidate = (name, party, ev) => {
      const div = document.createElement("div");
      div.className = "ec-candidate";
      div.innerHTML = `
        <span class="ec-candidate-dot" style="background:${getPartyColor(party)}"></span>
        <span class="ec-candidate-name">${name} (${party})</span>
        <span class="ec-candidate-votes">${ev}</span>
      `;
      candidatesEl.appendChild(div);
    };

    addCandidate(election.winner, election.winnerParty, election.electoralVotesWinner);
    if (election.runnerUp) {
      addCandidate(election.runnerUp, election.runnerUpParty, election.electoralVotesRunnerUp);
    }

    // Third parties
    const thirdSection = document.getElementById("third-section");
    const thirdEl = document.getElementById("third-parties");
    if (election.thirdParties && election.thirdParties.length > 0) {
      thirdSection.style.display = "block";
      thirdEl.innerHTML = "";
      election.thirdParties.forEach(tp => {
        const div = document.createElement("div");
        div.className = "third-party-item";
        const color = getPartyColor(tp.party);
        let detail = "";
        if (tp.electoralVotes > 0) detail = `${tp.electoralVotes} EV`;
        if (tp.popularVotePct) detail += `${detail ? " · " : ""}${tp.popularVotePct}% pop.`;
        div.innerHTML = `
          <span class="third-party-dot" style="background:${color}"></span>
          <span class="third-party-info">
            <span class="third-party-name">${tp.name}</span>
            <span class="third-party-detail">${tp.party}${detail ? " · " + detail : ""}</span>
          </span>
        `;
        thirdEl.appendChild(div);
      });
    } else {
      thirdSection.style.display = "none";
    }

    // Notes
    const noteSection = document.getElementById("note-section");
    const noteEl = document.getElementById("election-note");
    if (election.notes) {
      noteSection.style.display = "block";
      noteEl.textContent = election.notes;
    } else {
      noteSection.style.display = "none";
    }
  }

  // ===== RENDER MAP =====
  function renderMap() {
    const year = electionYears[currentYearIndex];
    const election = ELECTION_DATA.elections[year];
    if (!election) return;

    mapGroup.selectAll("*").remove();

    if (showCounties && election.hasCountyData) {
      renderCountyMap(election, year);
    } else {
      renderStateMap(election);
    }
  }

  function renderStateMap(election) {
    const states = election.states || {};
    const swingList = ELECTION_DATA.swingStates;
    const currentSwing = (+electionYears[currentYearIndex] >= 1990)
      ? swingList.modern
      : swingList.historical;

    // Draw states
    mapGroup.selectAll("path.state-path")
      .data(statesGeo.features)
      .enter()
      .append("path")
      .attr("class", d => {
        const abbr = STATE_FIPS[d.id];
        let cls = "state-path";
        if (showSwingStates && abbr && !currentSwing.includes(abbr)) {
          cls += " dimmed";
        }
        if (showSwingStates && abbr && currentSwing.includes(abbr)) {
          cls += " swing-highlight";
        }
        return cls;
      })
      .attr("d", pathGen)
      .attr("fill", d => {
        const abbr = STATE_FIPS[d.id];
        if (!abbr || !states[abbr]) return "var(--color-surface-2)";
        return getPartyColor(states[abbr].party);
      })
      .on("mouseover", function (event, d) {
        const abbr = STATE_FIPS[d.id];
        showTooltip(event, abbr, states[abbr], election);
      })
      .on("mousemove", function (event) {
        moveTooltip(event);
      })
      .on("mouseout", hideTooltip)
      .on("click", function (event, d) {
        const abbr = STATE_FIPS[d.id];
        if (election.hasCountyData && abbr) {
          showCounties = true;
          document.getElementById("county-btn").classList.add("active");
          document.getElementById("back-to-states").style.display = "flex";
          renderMap();
        }
      });
  }

  function renderCountyMap(election, year) {
    const states = election.states || {};

    // Generate simulated county-level data based on state results
    // Real county data would come from a detailed dataset
    const countyColors = generateCountyColors(election, year);

    mapGroup.selectAll("path.county-path")
      .data(countiesGeo.features)
      .enter()
      .append("path")
      .attr("class", "county-path")
      .attr("d", pathGen)
      .attr("fill", d => {
        const fips = d.id.toString();
        const stateFips = fips.length === 5 ? fips.substring(0, 2) : fips.length === 4 ? "0" + fips.substring(0, 1) : fips.substring(0, 2);
        const stateAbbr = STATE_FIPS[stateFips];
        
        if (countyColors[fips]) return countyColors[fips];
        if (!stateAbbr || !states[stateAbbr]) return "var(--color-surface-2)";
        return getPartyColor(states[stateAbbr].party);
      })
      .on("mouseover", function (event, d) {
        const fips = d.id.toString();
        const stateFips = fips.length === 5 ? fips.substring(0, 2) : "0" + fips.substring(0, 1);
        const stateAbbr = STATE_FIPS[stateFips];
        const countyName = d.properties ? d.properties.name : "County";
        showCountyTooltip(event, countyName, stateAbbr, states[stateAbbr]);
      })
      .on("mousemove", function (event) { moveTooltip(event); })
      .on("mouseout", hideTooltip);

    // State borders overlay
    mapGroup.append("path")
      .datum(statesMesh)
      .attr("class", "state-border")
      .attr("d", pathGen);
  }

  function generateCountyColors(election, year) {
    const colors = {};
    const states = election.states || {};
    const winnerParty = election.winnerParty;
    const runnerUpParty = election.runnerUpParty;

    // Use a seeded pseudo-random based on county FIPS + year for consistency
    function seededRandom(seed) {
      let x = Math.sin(seed) * 10000;
      return x - Math.floor(x);
    }

    countiesGeo.features.forEach(feature => {
      const fips = feature.id.toString();
      const stateFips = fips.length === 5 ? fips.substring(0, 2) : "0" + fips.substring(0, 1);
      const stateAbbr = STATE_FIPS[stateFips];
      
      if (!stateAbbr || !states[stateAbbr]) return;
      
      const stateData = states[stateAbbr];
      const stateParty = stateData.party;
      const margin = stateData.margin;
      
      // Determine county lean based on state result + variation
      const seed = parseInt(fips) * 1000 + parseInt(year);
      const rand = seededRandom(seed);
      
      // Tighter margins = more mixed counties
      const absMargin = margin ? Math.abs(margin) : 10;
      const flipThreshold = Math.max(0.05, 0.5 - absMargin / 60);
      
      let countyParty;
      if (rand < flipThreshold) {
        // This county goes against the state trend
        countyParty = stateParty === winnerParty ? runnerUpParty : winnerParty;
      } else {
        countyParty = stateParty;
      }
      
      // Vary shade based on margin strength
      const shadeRand = seededRandom(seed + 7777);
      const baseColor = getPartyColor(countyParty);
      
      // Adjust lightness for variety
      const adjustedColor = d3.color(baseColor);
      if (adjustedColor) {
        const lightAdj = (shadeRand - 0.5) * 0.3;
        adjustedColor.opacity = 1;
        const hsl = d3.hsl(adjustedColor);
        hsl.l = Math.max(0.2, Math.min(0.7, hsl.l + lightAdj));
        colors[fips] = hsl.formatHex();
      } else {
        colors[fips] = baseColor;
      }
    });

    return colors;
  }

  // ===== TOOLTIP =====
  function showTooltip(event, abbr, stateData, election) {
    if (!abbr) return;
    const tooltip = document.getElementById("tooltip");
    const stateName = STATE_NAMES[abbr] || abbr;
    
    document.getElementById("tooltip-state").textContent = stateName;
    
    if (stateData) {
      document.getElementById("tooltip-winner").innerHTML = 
        `<span style="color:${getPartyColor(stateData.party)};font-weight:600">${stateData.winner}</span> (${stateData.party})`;
      document.getElementById("tooltip-ev").textContent = 
        `${stateData.electoralVotes} electoral vote${stateData.electoralVotes !== 1 ? "s" : ""}`;
      if (stateData.margin !== null && stateData.margin !== undefined) {
        const sign = stateData.margin > 0 ? "+" : "";
        document.getElementById("tooltip-margin").textContent = `Margin: ${sign}${stateData.margin.toFixed(1)}%`;
        document.getElementById("tooltip-margin").style.display = "block";
      } else {
        document.getElementById("tooltip-margin").style.display = "none";
      }
    } else {
      document.getElementById("tooltip-winner").textContent = "Did not participate";
      document.getElementById("tooltip-ev").textContent = "";
      document.getElementById("tooltip-margin").style.display = "none";
    }
    
    tooltip.style.display = "block";
    moveTooltip(event);
  }

  function showCountyTooltip(event, countyName, stateAbbr, stateData) {
    const tooltip = document.getElementById("tooltip");
    const stateName = STATE_NAMES[stateAbbr] || stateAbbr || "";
    
    document.getElementById("tooltip-state").textContent = 
      countyName ? `${countyName}, ${stateName}` : stateName;
    
    if (stateData) {
      document.getElementById("tooltip-winner").innerHTML = 
        `State won by <span style="color:${getPartyColor(stateData.party)};font-weight:600">${stateData.winner}</span>`;
      document.getElementById("tooltip-ev").textContent = "";
      document.getElementById("tooltip-margin").style.display = "none";
    } else {
      document.getElementById("tooltip-winner").textContent = "";
      document.getElementById("tooltip-ev").textContent = "";
      document.getElementById("tooltip-margin").style.display = "none";
    }
    
    tooltip.style.display = "block";
    moveTooltip(event);
  }

  function moveTooltip(event) {
    const tooltip = document.getElementById("tooltip");
    const container = document.getElementById("map-container");
    const rect = container.getBoundingClientRect();
    
    let x = event.clientX - rect.left + 16;
    let y = event.clientY - rect.top - 10;
    
    // Keep tooltip in bounds
    const tw = tooltip.offsetWidth;
    const th = tooltip.offsetHeight;
    if (x + tw > rect.width - 10) x = x - tw - 32;
    if (y + th > rect.height - 10) y = y - th;
    if (y < 10) y = 10;
    
    tooltip.style.left = x + "px";
    tooltip.style.top = y + "px";
  }

  function hideTooltip() {
    document.getElementById("tooltip").style.display = "none";
  }

  // ===== LEGEND =====
  function updateLegend(election) {
    const legendEl = document.getElementById("legend-items");
    legendEl.innerHTML = "";
    
    // Get unique parties in this election
    const parties = new Set();
    const states = election.states || {};
    Object.values(states).forEach(s => parties.add(s.party));
    
    // Also add non-participating indicator if some states missing
    const totalPossibleStates = statesGeo.features.length;
    const participatingStates = Object.keys(states).length;

    parties.forEach(party => {
      const entry = document.createElement("div");
      entry.className = "legend-entry";
      entry.innerHTML = `<span class="legend-swatch" style="background:${getPartyColor(party)}"></span><span>${party}</span>`;
      legendEl.appendChild(entry);
    });

    if (participatingStates < totalPossibleStates) {
      const entry = document.createElement("div");
      entry.className = "legend-entry";
      entry.innerHTML = '<span class="legend-swatch" style="background:var(--color-surface-2);border:1px solid var(--color-border)"></span><span>Did not participate</span>';
      legendEl.appendChild(entry);
    }
  }

  // ===== INIT =====
  init();
})();
