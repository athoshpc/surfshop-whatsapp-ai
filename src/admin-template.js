function renderAdminPage() {
  return `<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Tikehau Admin</title>
  <style>
    :root {
      --bg: #f4efe6;
      --panel: #fff9f0;
      --line: #d8cdbd;
      --ink: #1f2d2a;
      --muted: #6a746f;
      --accent: #007f73;
      --accent-dark: #005f56;
      --sand: #e9dcc6;
      --danger: #b7483b;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      font-family: Georgia, "Trebuchet MS", sans-serif;
      background: linear-gradient(180deg, #f6f1e7 0%, #efe5d4 100%);
      color: var(--ink);
    }
    .wrap {
      max-width: 1200px;
      margin: 0 auto;
      padding: 24px;
    }
    .hero {
      padding: 24px;
      border-radius: 24px;
      background: linear-gradient(135deg, #083d3a, #1f7a70);
      color: #fff8ec;
      margin-bottom: 24px;
    }
    .hero h1 { margin: 0 0 8px; font-size: 36px; }
    .hero p { margin: 0; max-width: 720px; line-height: 1.5; }
    .grid {
      display: grid;
      grid-template-columns: 1.1fr 0.9fr;
      gap: 24px;
      align-items: start;
    }
    .panel {
      background: var(--panel);
      border: 1px solid var(--line);
      border-radius: 20px;
      padding: 20px;
      box-shadow: 0 10px 30px rgba(31,45,42,0.08);
    }
    .panel h2 { margin: 0 0 16px; font-size: 24px; }
    .boards {
      display: grid;
      gap: 12px;
    }
    .board-card {
      border: 1px solid var(--line);
      border-radius: 16px;
      padding: 14px;
      background: #fffdf8;
      display: grid;
      gap: 8px;
    }
    .board-card strong { font-size: 18px; }
    .meta {
      color: var(--muted);
      font-size: 14px;
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
    }
    .actions {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
      margin-top: 4px;
    }
    button {
      border: 0;
      border-radius: 999px;
      padding: 10px 14px;
      font-weight: 700;
      cursor: pointer;
    }
    .btn-primary { background: var(--accent); color: white; }
    .btn-primary:hover { background: var(--accent-dark); }
    .btn-ghost { background: var(--sand); color: var(--ink); }
    .btn-danger { background: #fbe1dc; color: var(--danger); }
    form {
      display: grid;
      gap: 14px;
    }
    .field-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 12px;
    }
    label {
      display: grid;
      gap: 6px;
      font-size: 14px;
      font-weight: 700;
    }
    input, select, textarea {
      width: 100%;
      padding: 12px 14px;
      border-radius: 12px;
      border: 1px solid var(--line);
      background: white;
      color: var(--ink);
      font: inherit;
    }
    textarea { min-height: 110px; resize: vertical; }
    .status {
      min-height: 24px;
      font-size: 14px;
      color: var(--muted);
    }
    .status.error { color: var(--danger); }
    .status.success { color: var(--accent-dark); }
    @media (max-width: 900px) {
      .grid, .field-grid { grid-template-columns: 1fr; }
      .wrap { padding: 16px; }
      .hero h1 { font-size: 28px; }
    }
  </style>
</head>
<body>
  <div class="wrap">
    <section class="hero">
      <h1>Tikehau Surf Shop Admin</h1>
      <p>Cadastro rapido do acervo pra tocar o WhatsApp e preparar a vitrine. Aqui voce organiza titulo, preco, litragem, sistema de quilhas e os caminhos das fotos.</p>
    </section>

    <div class="grid">
      <section class="panel">
        <h2>Acervo</h2>
        <div id="boards" class="boards"></div>
      </section>

      <section class="panel">
        <h2 id="formTitle">Nova prancha</h2>
        <form id="boardForm">
          <div class="field-grid">
            <label>ID
              <input name="id" placeholder="used-pranchinha-exemplo" required />
            </label>
            <label>Tipo
              <select name="type" required>
                <option value="longboard">Longboard</option>
                <option value="pranchinha">Pranchinha</option>
                <option value="fish">Fish</option>
                <option value="fun">Fun</option>
              </select>
            </label>
          </div>

          <label>Titulo
            <input name="title" placeholder="Pranchinha Sharpeye" required />
          </label>

          <div class="field-grid">
            <label>Litragem
              <input name="liters" placeholder="27.8L" />
            </label>
            <label>Preco
              <input name="price" placeholder="R$ 1.890" />
            </label>
          </div>

          <div class="field-grid">
            <label>Estado
              <input name="condition" placeholder="muito bom" />
            </label>
            <label>Sistema de quilhas
              <input name="finSystem" placeholder="FCS2" />
            </label>
          </div>

          <label>Descricao
            <textarea name="description" placeholder="Pranchinha usada, solta e boa pro surf do dia a dia."></textarea>
          </label>

          <div class="field-grid">
            <label>Foto 1 (storagePath)
              <input name="photoDeck" placeholder="boards/used-pranchinha/deck.jpeg" />
            </label>
            <label>Foto 2 (storagePath)
              <input name="photoBottom" placeholder="boards/used-pranchinha/bottom.jpeg" />
            </label>
          </div>

          <div class="actions">
            <button type="submit" class="btn-primary">Salvar prancha</button>
            <button type="button" id="newBoard" class="btn-ghost">Nova prancha</button>
          </div>
          <div id="status" class="status"></div>
        </form>
      </section>
    </div>
  </div>

  <script>
    const boardsEl = document.getElementById("boards");
    const form = document.getElementById("boardForm");
    const statusEl = document.getElementById("status");
    const formTitleEl = document.getElementById("formTitle");
    const newBoardBtn = document.getElementById("newBoard");

    function setStatus(message, type) {
      statusEl.textContent = message;
      statusEl.className = ("status " + (type || "")).trim();
    }

    function boardPhotoPath(board, label) {
      return (board.photos || []).find(function (photo) { return photo.label === label; })?.storagePath || "";
    }

    function fillForm(board) {
      form.id.value = board.id || "";
      form.type.value = board.type || "pranchinha";
      form.title.value = board.title || "";
      form.liters.value = board.liters || "";
      form.price.value = board.price || "";
      form.condition.value = board.condition || "";
      form.finSystem.value = board.finSystem || "";
      form.description.value = board.description || "";
      form.photoDeck.value = boardPhotoPath(board, "deck");
      form.photoBottom.value = boardPhotoPath(board, "bottom");
      formTitleEl.textContent = "Editar: " + board.title;
      setStatus("Editando prancha selecionada.");
    }

    function resetForm() {
      form.reset();
      form.type.value = "pranchinha";
      formTitleEl.textContent = "Nova prancha";
      setStatus("Pronto para cadastrar uma nova prancha.");
    }

    async function loadBoards() {
      const response = await fetch("/admin/api/boards");
      const boards = await response.json();

      boardsEl.innerHTML = boards.map(function (board) {
        return [
          '<article class="board-card">',
          '<strong>' + board.title + '</strong>',
          '<div class="meta">',
          '<span>' + board.type + '</span>',
          '<span>' + board.liters + '</span>',
          '<span>' + board.price + '</span>',
          '<span>' + board.finSystem + '</span>',
          '</div>',
          '<div>' + (board.description || 'Sem descricao') + '</div>',
          '<div class="actions">',
          '<button type="button" class="btn-ghost" data-edit="' + board.id + '">Editar</button>',
          '<button type="button" class="btn-danger" data-delete="' + board.id + '">Excluir</button>',
          '</div>',
          '</article>'
        ].join('');
      }).join("");

      boardsEl.querySelectorAll("[data-edit]").forEach(function (button) {
        button.addEventListener("click", async function () {
          const response = await fetch("/admin/api/boards/" + button.dataset.edit);
          if (!response.ok) {
            setStatus("Nao consegui carregar essa prancha.", "error");
            return;
          }
          const board = await response.json();
          fillForm(board);
        });
      });

      boardsEl.querySelectorAll("[data-delete]").forEach(function (button) {
        button.addEventListener("click", async function () {
          if (!confirm("Quer mesmo excluir essa prancha do acervo?")) return;
          const response = await fetch("/admin/api/boards/" + button.dataset.delete, { method: "DELETE" });
          if (!response.ok) {
            setStatus("Nao consegui excluir essa prancha.", "error");
            return;
          }
          setStatus("Prancha excluida do acervo.", "success");
          if (form.id.value === button.dataset.delete) resetForm();
          await loadBoards();
        });
      });
    }

    form.addEventListener("submit", async function (event) {
      event.preventDefault();
      const payload = {
        id: form.id.value,
        type: form.type.value,
        title: form.title.value,
        liters: form.liters.value,
        price: form.price.value,
        condition: form.condition.value,
        finSystem: form.finSystem.value,
        description: form.description.value,
        photoDeck: form.photoDeck.value,
        photoBottom: form.photoBottom.value
      };

      const response = await fetch("/admin/api/boards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const error = await response.json().catch(function () { return { error: "Nao consegui salvar." }; });
        setStatus(error.error || "Nao consegui salvar.", "error");
        return;
      }

      const board = await response.json();
      fillForm(board);
      setStatus("Prancha salva com sucesso.", "success");
      await loadBoards();
    });

    newBoardBtn.addEventListener("click", resetForm);

    resetForm();
    loadBoards().catch(function () {
      setStatus("Nao consegui carregar o acervo.", "error");
    });
  </script>
</body>
</html>`;
}

module.exports = {
  renderAdminPage
};
