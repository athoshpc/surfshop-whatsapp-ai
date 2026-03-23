const fs = require("fs");
const path = require("path");

const boardsFilePath = path.join(__dirname, "boards.json");

const boardTypeLabels = {
  longboard: "Longboard",
  pranchinha: "Pranchinha",
  fish: "Fish",
  fun: "Fun"
};

function readBoards() {
  const raw = fs.readFileSync(boardsFilePath, "utf8");
  const sanitized = raw.replace(/^\uFEFF/, "");
  return JSON.parse(sanitized);
}

function writeBoards(boards) {
  fs.writeFileSync(boardsFilePath, `${JSON.stringify(boards, null, 2)}\n`, "utf8");
}

function getBoards() {
  return readBoards();
}

function getBoardsByType(type) {
  return readBoards().filter((board) => board.type === type);
}

function getBoardById(id) {
  return readBoards().find((board) => board.id === id) || null;
}

function upsertBoard(boardInput) {
  const boards = readBoards();
  const board = normalizeBoard(boardInput);
  const index = boards.findIndex((item) => item.id === board.id);

  if (index >= 0) {
    boards[index] = board;
  } else {
    boards.push(board);
  }

  writeBoards(boards);
  return board;
}

function setBoardPhoto(boardId, label, storagePath) {
  const boards = readBoards();
  const index = boards.findIndex((board) => board.id === boardId);

  if (index < 0) {
    throw new Error("Board not found.");
  }

  const board = boards[index];
  const photos = Array.isArray(board.photos) ? [...board.photos] : [];
  const photoIndex = photos.findIndex((photo) => photo.label === label);
  const nextPhoto = {
    label,
    localFile: "",
    storagePath: String(storagePath || "").trim()
  };

  if (photoIndex >= 0) {
    photos[photoIndex] = {
      ...photos[photoIndex],
      ...nextPhoto
    };
  } else {
    photos.push(nextPhoto);
  }

  boards[index] = normalizeBoard({
    ...board,
    photos
  });

  writeBoards(boards);
  return boards[index];
}

function deleteBoard(id) {
  const boards = readBoards();
  const filteredBoards = boards.filter((board) => board.id !== id);

  if (filteredBoards.length === boards.length) {
    return false;
  }

  writeBoards(filteredBoards);
  return true;
}

function normalizeBoard(board) {
  const id = String(board.id || "").trim();
  const type = String(board.type || "").trim();
  const title = String(board.title || "").trim();

  if (!id) throw new Error("Board id is required.");
  if (!type) throw new Error("Board type is required.");
  if (!title) throw new Error("Board title is required.");

  const photos = Array.isArray(board.photos)
    ? board.photos
    : [board.photoDeck, board.photoBottom]
        .filter(Boolean)
        .map((storagePath, index) => ({
          label: index === 0 ? "deck" : "bottom",
          localFile: "",
          storagePath: String(storagePath).trim()
        }));

  return {
    id,
    type,
    title,
    liters: String(board.liters || "").trim() || "A confirmar",
    price: String(board.price || "").trim() || "A confirmar",
    condition: String(board.condition || "").trim() || "A confirmar",
    finSystem: String(board.finSystem || "").trim() || "A confirmar",
    description: String(board.description || "").trim() || "Descricao a confirmar.",
    photos: photos.map((photo, index) => ({
      label: String(photo.label || (index === 0 ? "deck" : "bottom")).trim(),
      localFile: String(photo.localFile || "").trim(),
      storagePath: String(photo.storagePath || "").trim()
    }))
  };
}

module.exports = {
  boardTypeLabels,
  deleteBoard,
  getBoardById,
  getBoards,
  getBoardsByType,
  setBoardPhoto,
  upsertBoard
};
