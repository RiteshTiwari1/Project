const express = require("express");
const bodyParser = require("body-parser");

const app = express();
const PORT = process.env.PORT || 3000;

const weightTable = {
  A: 3,
  B: 2,
  C: 8,
  D: 12,
  E: 25,
  F: 15,
  G: 0.5,
  H: 1,
  I: 2,
};

const distanceCostTable = {
  C1: { L1: 3, C3: 5, C2: 4 },
  C2: { L1: 2.5, C1: 4, C3: 3 },
  C3: { L1: 2, C2: 3, C1: 5 },
  L1: { C1: 3, C2: 2.5, C3: 2 },
};
// c1 -> 1 c2-> 2 c3->3 L1->4
const distanceCostTableFormatted = {
  1: { 4: 3, 3: 5, 2: 4 },
  2: { 4: 2.5, 1: 4, 3: 3 },
  3: { 4: 2, 2: 3, 1: 5 },
  4: { 1: 3, 2: 2.5, 3: 2 },
};

function deleteIfZero(table, center, order) {
  if (order[center] === 0) {
    delete table[center];
    delete order[center];
    for (let centers in table) {
      delete table[centers][center];
    }
  }
}
function dfs(current, path, paths, visited, total, container) {
  visited.add(current);
  path.push(current);
  if (total == 0) {
    if (path[path.length - 1] !== "L1") {
      path.push("L1");
    }
    if (container.has(path)) {
    } else {
      paths.push(path.join(","));
      container.add(path);
    }
  } else {
    for (let neighbor in distanceCostTable[current]) {
      if (!visited.has(neighbor)) {
        total--;
        dfs(neighbor, [...path], paths, visited, total, container);
        total++;
      } else {
        if (neighbor === "L1") {
          dfs(neighbor, [...path], paths, visited, total, container);
        }
      }
    }
  }
  visited.delete(current);
}
function calculateMinCost(o) {
  let totalCost = Infinity;
  let C1 = 0;
  let C2 = 0;
  let C3 = 0;
  let order = {};
  for (let center in o) {
    if (center === "A" || center === "B" || center === "C") {
      C1 += weightTable[center] * o[center];
    }
    if (center === "D" || center === "E" || center === "F") {
      C2 += weightTable[center] * o[center];
    }
    if (center === "G" || center === "H" || center === "I") {
      C3 += weightTable[center] * o[center];
    }
  }
  order.C1 = C1;
  order.C2 = C2;
  order.C3 = C3;

  
  deleteIfZero(distanceCostTable, "C1", order);
  deleteIfZero(distanceCostTable, "C2", order);
  deleteIfZero(distanceCostTable, "C3", order);
  
  let total = 0;
  for (let node in order) {
    total++;
  }

//   console.log(total);
  function generateAllPaths() {
    const paths = [];
    const container = new Set();
    for (let node in order) {
        
      const visited = new Set();
      dfs(node, [], paths, visited, total, container);
    //   console.log(node);
    //   console.log(paths);
    }
    return paths;
  }
  const allPaths = generateAllPaths();
//   console.log(allPaths);
  let correctPaths = [];
  for (let i = 0; i < allPaths.length; i++) {
    let consist = 0;
    let formattedArray = [];
    for (let j = 0; j < allPaths[i].length; j++) {
      if (allPaths[i][j] == "C") {
        consist++;
        if (allPaths[i][j + 1] == "1") {
          formattedArray.push(1);
        }
        if (allPaths[i][j + 1] == "2") {
          formattedArray.push(2);
        }
        if (allPaths[i][j + 1] == "3") {
          formattedArray.push(3);
        }
      } else if (allPaths[i][j] == "L") {
        formattedArray.push(4);
      }
    }
    if (consist === total) {
      correctPaths.push(formattedArray);
    }
  }
//   console.log(correctPaths);
  for (let i = 0; i < correctPaths.length; i++) {
    let currentValue = 0;
    let weight = 0;
    if (correctPaths[i][0] === 1) {
      weight = order.C1;
    }
    if (correctPaths[i][0] === 2) {
      weight = order.C2;
    }
    if (correctPaths[i][0] === 3) {
      weight = order.C3;
    }
    for (let j = 1; j < correctPaths[i].length; j++) {
      if (correctPaths[i][j] == 4) {
        let additionalCost = 0;
        if (weight > 5) {
          additionalCost = Math.ceil((weight - 5) / 5) * 8;
        }
        let totalCost = additionalCost + 10;
        currentValue +=
          distanceCostTableFormatted[correctPaths[i][j]][
            correctPaths[i][j - 1]
          ] * totalCost;
        weight = 0;
      } else {
        let additionalCost = 0;
        if (weight > 5) {
          additionalCost = Math.ceil((weight - 5) / 5) * 8;
        }
        let totalCost = additionalCost + 10;
        currentValue +=
          distanceCostTableFormatted[correctPaths[i][j]][
            correctPaths[i][j - 1]
          ] * totalCost;
        if (correctPaths[i][j] === 1) {
          weight += order.C1;
        }
        if (correctPaths[i][j] === 2) {
          weight += order.C2;
        }
        if (correctPaths[i][j] === 3) {
          weight += order.C3;
        }
      }
    }
    totalCost = Math.min(totalCost, currentValue);
  }
  return totalCost;
}

app.use(bodyParser.json());

app.post("/calculate_min_cost", (req, res) => {
  const order = req.body;
  if (!order) {
    return res.status(400).json({ error: "No data provided" });
  }
  const minCost = calculateMinCost(order);
  res.status(200).json({ min_cost: minCost });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
  



