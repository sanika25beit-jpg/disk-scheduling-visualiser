function getInput() {
    const requests = document.getElementById("requests").value
        .split(",")
        .map(Number)
        .filter(n => !isNaN(n));

    const head = Number(document.getElementById("head").value);

    return { requests, head };
}


// ================= SSTF =================
function sstf(requests, head) {
    let pending = [...requests];
    let sequence = [head];
    let current = head;
    let total = 0;

    while (pending.length > 0) {
        let nearestIndex = 0;
        let minDistance = Math.abs(pending[0] - current);

        for (let i = 1; i < pending.length; i++) {
            let distance = Math.abs(pending[i] - current);

            if (distance < minDistance) {
                minDistance = distance;
                nearestIndex = i;
            }
        }

        current = pending[nearestIndex];
        total += minDistance;
        sequence.push(current);
        pending.splice(nearestIndex, 1);
    }

    return { sequence, total };
}


// ================= LOOK =================
function look(requests, head) {
    let left = requests.filter(x => x < head).sort((a, b) => b - a);
    let right = requests.filter(x => x >= head).sort((a, b) => a - b);

    let sequence = [head];
    let current = head;
    let total = 0;

    for (let x of right) {
        total += Math.abs(x - current);
        current = x;
        sequence.push(x);
    }

    for (let x of left) {
        total += Math.abs(x - current);
        current = x;
        sequence.push(x);
    }

    return { sequence, total };
}


// ================= C-LOOK =================
function clook(requests, head) {
    let left = requests.filter(x => x < head).sort((a, b) => a - b);
    let right = requests.filter(x => x >= head).sort((a, b) => a - b);

    let sequence = [head];
    let current = head;
    let total = 0;

    for (let x of right) {
        total += Math.abs(x - current);
        current = x;
        sequence.push(x);
    }

    if (left.length > 0) {
        total += Math.abs(current - left[0]);
        current = left[0];
        sequence.push(left[0]);

        for (let i = 1; i < left.length; i++) {
            total += Math.abs(left[i] - current);
            current = left[i];
            sequence.push(left[i]);
        }
    }

    return { sequence, total };
}


// ================= DISPLAY RESULT =================
function showResult(algorithm, result, diskSize) {

    document.getElementById("algorithmResult").textContent = algorithm;

    document.getElementById("sequenceResult").textContent =
        result.sequence.join(" → ");

    document.getElementById("seekTimeResult").textContent =
        result.total;

    document.getElementById("movementResult").textContent =
        result.sequence.length - 1;

    createVisualization(result.sequence, diskSize);
}


// ================= VISUALIZATION =================
function createVisualization(sequence, diskSize) {

    const track = document.getElementById("diskTrack");

    if (!track) {
        console.error("diskTrack not found");
        return;
    }

    track.innerHTML = "";

    const width = track.clientWidth;
    const height = 300;

    const svg = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "svg"
    );

    svg.setAttribute("width", "100%");
    svg.setAttribute("height", height);

    svg.style.position = "absolute";
    svg.style.left = "0";
    svg.style.top = "0";

    track.appendChild(svg);

    const points = [];

    sequence.forEach((value, index) => {

        const x = (value / (diskSize - 1)) * width;

        const y =
            30 +
            index * (height - 60) /
            (sequence.length - 1 || 1);

        points.push({ x, y });

        const point = document.createElement("div");

        point.className = "disk-point";

        if (index === 0) {
            point.classList.add("head-point");
        }

        point.style.left = x + "px";
        point.style.top = y + "px";

        track.appendChild(point);


        const label = document.createElement("div");

        label.className = "disk-label";

        label.textContent = value;

        label.style.left = x + "px";
        label.style.top = (y + 18) + "px";

        track.appendChild(label);
    });


    // Connect points
    for (let i = 0; i < points.length - 1; i++) {

        const line = document.createElementNS(
            "http://www.w3.org/2000/svg",
            "line"
        );

        line.setAttribute("x1", points[i].x);
        line.setAttribute("y1", points[i].y);

        line.setAttribute("x2", points[i + 1].x);
        line.setAttribute("y2", points[i + 1].y);

        line.setAttribute("stroke", "green");
        line.setAttribute("stroke-width", "3");

        svg.appendChild(line);
    }
}

// ================= STEP-BY-STEP MOVEMENTS =================
function createSteps(sequence, total) {

    const steps = document.getElementById("stepsResult");

    if (!steps) {
        console.error("stepsResult not found");
        return;
    }

    steps.innerHTML = "";

    for (let i = 0; i < sequence.length - 1; i++) {

        const from = sequence[i];
        const to = sequence[i + 1];

        const movement = Math.abs(to - from);

        const step = document.createElement("p");

        step.textContent =
            `${i + 1}. ${from} → ${to}    Movement: ${movement}`;

        steps.appendChild(step);
    }

    document.getElementById("totalText").textContent =
        `Total Seek Time: ${total}`;
}
// ================= START BUTTON =================

document.getElementById("startBtn").addEventListener("click", function () {

    const { requests, head } = getInput();

    const diskSize = Number(
        document.getElementById("diskSize").value
    );

    const algorithm =
        document.getElementById("algorithm").value;

    let result;

    if (algorithm === "SSTF") {
        result = sstf(requests, head);
    }

    else if (algorithm === "LOOK") {
        result = look(requests, head);
    }

    else if (algorithm === "CLOOK") {
        result = clook(requests, head);
    }

    showResult(algorithm, result, diskSize);

    document.getElementById("diskMax").textContent =
        diskSize - 1;

    createSteps(result.sequence, result.total);
});

