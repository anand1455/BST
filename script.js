class Node {
    constructor(value, x, y) {
        this.value = value;
        this.left = null;
        this.right = null;
        this.x = x;
        this.y = y;
        this.element = this.createNodeElement();
    }

    createNodeElement() {
        const div = document.createElement("div");
        div.className = "node";
        div.innerText = this.value;
        div.style.left = `${this.x}px`;
        div.style.top = `${this.y}px`;
        tree.appendChild(div);
        return div;
    }
}

let root = null;
const startX = window.innerWidth / 2 - 24;
const startY = 50;
const gapY = 90;

/* ---------- INSERT ---------- */
function insertNode() {
    clearEffects();
    const v = parseInt(valueInput.value);
    if (isNaN(v)) return updateStatus("Enter a value.");

    root = insert(root, v, startX, startY, 200);
    redraw();
    updateStatus(`Inserted: ${v}`);
}

function insert(node, v, x, y, gap) {
    if (!node) return new Node(v, x, y);
    if (v < node.value)
        node.left = insert(node.left, v, x - gap, y + gapY, gap / 1.8);
    else if (v > node.value)
        node.right = insert(node.right, v, x + gap, y + gapY, gap / 1.8);
    return node;
}

/* ---------- DELETE (FIXED) ---------- */
function deleteNode() {
    clearEffects();
    const v = parseInt(valueInput.value);
    if (isNaN(v)) return updateStatus("Enter a value to delete.");

    if (!searchValue(root, v)) {
        updateStatus(`Value ${v} not found.`);
        return;
    }

    root = remove(root, v);
    redraw();
    updateStatus(`Deleted: ${v}`);
}

function remove(node, v) {
    if (!node) return null;

    if (v < node.value) {
        node.left = remove(node.left, v);
    } else if (v > node.value) {
        node.right = remove(node.right, v);
    } else {
        // Case 1 & 2
        if (!node.left) return node.right;
        if (!node.right) return node.left;

        // Case 3: two children
        let successor = node.right;
        while (successor.left) successor = successor.left;
        node.value = successor.value;
        node.right = remove(node.right, successor.value);
    }
    return node;
}

function searchValue(node, v) {
    if (!node) return false;
    if (v === node.value) return true;
    return v < node.value
        ? searchValue(node.left, v)
        : searchValue(node.right, v);
}

/* ---------- SEARCH ---------- */
async function searchNode() {
    clearEffects();
    const v = parseInt(valueInput.value);
    if (isNaN(v)) return updateStatus("Enter a value.");
    if (!root) return updateStatus("Tree is empty.");

    let curr = root;
    let path = [];

    while (curr) {
        path.push(curr.value);
        curr.element.classList.add("active");

        if (v === curr.value) {
            updateStatus(`SEARCH PATH: ${path.join(" → ")} (FOUND)`);
            return;
        }
        await new Promise(r => setTimeout(r, 500));
        curr = v < curr.value ? curr.left : curr.right;
    }
    updateStatus(`SEARCH PATH: ${path.join(" → ")} (NOT FOUND)`);
}

/* ---------- TRAVERSALS ---------- */
async function visualizeTraversal(type) {
    clearEffects();
    if (!root) return updateStatus("Tree is empty.");

    let nodes = [];
    let values = [];

    if (type === "inorder")
        (function t(n){ if(n){ t(n.left); nodes.push(n); values.push(n.value); t(n.right); } })(root);

    if (type === "preorder")
        (function t(n){ if(n){ nodes.push(n); values.push(n.value); t(n.left); t(n.right); } })(root);

    if (type === "postorder")
        (function t(n){ if(n){ t(n.left); t(n.right); nodes.push(n); values.push(n.value); } })(root);

    traversalTitle.innerText = type.toUpperCase();
    updateStatus(`${type.toUpperCase()}: ${values.join(" → ")}`);

    for (let n of nodes) {
        n.element.classList.add("active");
        await new Promise(r => setTimeout(r, 600));
    }
}
/* ---------- ANALYTICS / HANDLE OPERATIONS ---------- */
function handleOperation() {
    const op = operationSelect.value;

    if (!root) {
        updateStatus("Tree is empty.");
        operationSelect.value = "";
        return;
    }

    clearEffects();

    switch (op) {
        case "min":
            let min = root;
            while (min.left) min = min.left;
            highlight(min, `Min Value: ${min.value}`);
            break;

        case "max":
            let max = root;
            while (max.right) max = max.right;
            highlight(max, `Max Value: ${max.value}`);
            break;

        case "height":
            updateStatus(`Tree Height: ${treeHeight(root)}`);
            break;

        case "count":
            updateStatus(`Total Nodes: ${countNodes(root)}`);
            break;

        case "leaf":
            updateStatus(`Leaf Nodes: ${countLeaves(root)}`);
            break;

        case "validate":
            updateStatus(isValidBST(root, -Infinity, Infinity)
                ? "Valid BST"
                : "Invalid BST");
            break;
    }

    operationSelect.value = "";
}

/* ---------- ANALYTICS HELPERS ---------- */
function treeHeight(node) {
    if (!node) return -1;
    return 1 + Math.max(treeHeight(node.left), treeHeight(node.right));
}

function countNodes(node) {
    if (!node) return 0;
    return 1 + countNodes(node.left) + countNodes(node.right);
}

function countLeaves(node) {
    if (!node) return 0;
    if (!node.left && !node.right) return 1;
    return countLeaves(node.left) + countLeaves(node.right);
}

function isValidBST(node, min, max) {
    if (!node) return true;
    if (node.value <= min || node.value >= max) return false;
    return isValidBST(node.left, min, node.value) &&
           isValidBST(node.right, node.value, max);
}

function highlight(node, msg) {
    node.element.classList.add("active");
    updateStatus(msg);
}


/* ---------- HELPERS ---------- */
function redraw() {
    tree.innerHTML = "";
    lines.innerHTML = "";
    if (root) rebuild(root, startX, startY, 200);
    nodeCount.innerText = document.querySelectorAll(".node").length;
}

function rebuild(n, x, y, gap) {
    if (!n) return;
    n.x = x; n.y = y;
    n.element = n.createNodeElement();
    if (n === root) n.element.classList.add("root");

    if (n.left) {
        drawLine(x, y, x - gap, y + gapY);
        rebuild(n.left, x - gap, y + gapY, gap / 1.8);
    }
    if (n.right) {
        drawLine(x, y, x + gap, y + gapY);
        rebuild(n.right, x + gap, y + gapY, gap / 1.8);
    }
}

function drawLine(x1, y1, x2, y2) {
    const l = document.createElementNS("http://www.w3.org/2000/svg", "line");
    l.setAttribute("x1", x1 + 24);
    l.setAttribute("y1", y1 + 24);
    l.setAttribute("x2", x2 + 24);
    l.setAttribute("y2", y2 + 24);
    lines.appendChild(l);
}

function updateStatus(msg) {
    traversalResult.innerText = msg;
}

function clearEffects() {
    document.querySelectorAll(".node").forEach(n => n.classList.remove("active"));
}
