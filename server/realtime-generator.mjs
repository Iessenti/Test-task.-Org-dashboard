const METRIC_NAMES = ["headcount", "budget", "performance"];

const SCRIPTED_PATCHES = [
    // Команда 1.1.1: эффективность 41 → 48.
    { nodeId: "division-1-department-1-team-1", metrics: { performance: 48 } },
    // Команда 1.1.2: сотрудники 7 → 10.
    { nodeId: "division-1-department-1-team-2", metrics: { headcount: 10 } },
    // Команда 1.1.3: бюджет 42 250 ₽ → 43 250 ₽.
    { nodeId: "division-1-department-1-team-3", metrics: { budget: 43_250 } },
    // Команда 1.1.1: эффективность 48 → 41.
    { nodeId: "division-1-department-1-team-1", metrics: { performance: 41 } },
    // Команда 1.1.2: сотрудники 10 → 7.
    { nodeId: "division-1-department-1-team-2", metrics: { headcount: 7 } },
    // Команда 1.1.3: бюджет 43 250 ₽ → 42 250 ₽.
    { nodeId: "division-1-department-1-team-3", metrics: { budget: 42_250 } },
];

const cloneMetrics = (node) => ({
    headcount: node.headcount,
    budget: node.budget,
    performance: node.performance,
});

function assertGeneratorNode(node) {
    if (node === null || typeof node !== "object") {
        throw new TypeError("Realtime generator requires organization nodes.");
    }

    if (typeof node.id !== "string" || typeof node.name !== "string") {
        throw new TypeError(
            "Realtime generator requires node identity and name.",
        );
    }

    if (!Number.isInteger(node.headcount) || node.headcount < 0) {
        throw new RangeError(
            `Invalid headcount for organization node: ${node.id}`,
        );
    }

    if (!Number.isFinite(node.budget) || node.budget < 0) {
        throw new RangeError(
            `Invalid budget for organization node: ${node.id}`,
        );
    }

    if (
        !Number.isFinite(node.performance) ||
        node.performance < 0 ||
        node.performance > 100
    ) {
        throw new RangeError(
            `Invalid performance for organization node: ${node.id}`,
        );
    }
}

function nextMetricValue(metric, currentValue, emissionIndex) {
    if (metric === "headcount") {
        return currentValue === 0 || emissionIndex % 2 === 0
            ? currentValue + 1
            : currentValue - 1;
    }

    if (metric === "budget") {
        return currentValue === 0 || emissionIndex % 2 === 0
            ? currentValue + 500
            : currentValue - 500;
    }

    return (currentValue + 7) % 101;
}

export function createMetricChangeGenerator(nodes) {
    const sourceNodes = [...nodes];
    sourceNodes.forEach(assertGeneratorNode);

    if (sourceNodes.length === 0) {
        throw new RangeError(
            "Realtime generator requires at least one organization node.",
        );
    }

    const currentMetricsById = new Map(
        sourceNodes.map((node) => [node.id, cloneMetrics(node)]),
    );
    let emissionIndex = 0;

    return {
        next() {
            const node = sourceNodes[emissionIndex % sourceNodes.length];
            const metric = METRIC_NAMES[emissionIndex % METRIC_NAMES.length];
            const currentMetrics = currentMetricsById.get(node.id);
            const nextValue = nextMetricValue(
                metric,
                currentMetrics[metric],
                emissionIndex,
            );

            currentMetricsById.set(node.id, {
                ...currentMetrics,
                [metric]: nextValue,
            });
            emissionIndex += 1;

            return {
                nodeId: node.id,
                metrics: { [metric]: nextValue },
            };
        },
    };
}

export function createScriptedMetricChangeGenerator(nodes) {
    const nodesById = new Map(nodes.map((node) => [node.id, node]));
    for (const patch of SCRIPTED_PATCHES) {
        if (!nodesById.has(patch.nodeId)) {
            throw new RangeError(
                `Scripted realtime fixture is missing ${patch.nodeId}.`,
            );
        }
    }

    let patchIndex = 0;
    return {
        next() {
            const patch =
                SCRIPTED_PATCHES[patchIndex % SCRIPTED_PATCHES.length];
            patchIndex += 1;
            return {
                nodeId: patch.nodeId,
                metrics: { ...patch.metrics },
            };
        },
    };
}

export function createRealtimeMetricChangeGenerator(nodes, mode) {
    return mode === "scripted"
        ? createScriptedMetricChangeGenerator(nodes)
        : createMetricChangeGenerator(nodes);
}
