const Hapi = require("@hapi/hapi");
const { nanoid } = require("nanoid");

const init = async () => {
  const server = Hapi.server({
    port: 9000,
    host: "localhost",
  });

  const books = []; // Array penyimpanan buku

  //   post
  server.route({
    method: "POST",
    path: "/books",
    handler: (request, h) => {
      const {
        name,
        year,
        author,
        summary,
        publisher,
        pageCount,
        readPage,
        reading,
      } = request.payload;

      if (!name) {
        return h
          .response({
            status: "fail",
            message: "Gagal menambahkan buku. Mohon isi nama buku",
          })
          .code(400);
      }

      if (readPage > pageCount) {
        return h
          .response({
            status: "fail",
            message:
              "Gagal menambahkan buku. readPage tidak boleh lebih besar dari pageCount",
          })
          .code(400);
      }

      const id = nanoid(16);
      const finished = pageCount === readPage;
      const insertedAt = new Date().toISOString();
      const updatedAt = insertedAt;

      const newBook = {
        id,
        name,
        year,
        author,
        summary,
        publisher,
        pageCount,
        readPage,
        reading,
        finished,
        insertedAt,
        updatedAt,
      };
      books.push(newBook);

      return h
        .response({
          status: "success",
          message: "Buku berhasil ditambahkan",
          data: {
            bookId: id,
          },
        })
        .code(201);
    },
  });

  //   get
  // GET all books with query parameters
  server.route({
    method: "GET",
    path: "/books",
    handler: (request, h) => {
      const { name, reading, finished } = request.query;

      // Salin daftar buku
      let filteredBooks = books;

      // Filter berdasarkan parameter `name` (non-case sensitive)
      if (name) {
        const lowerCaseName = name.toLowerCase();
        filteredBooks = filteredBooks.filter((book) =>
          book.name.toLowerCase().includes(lowerCaseName)
        );
      }

      // Filter berdasarkan parameter `reading`
      if (reading !== undefined) {
        const isReading = reading === "1";
        filteredBooks = filteredBooks.filter(
          (book) => book.reading === isReading
        );
      }

      // Filter berdasarkan parameter `finished`
      if (finished !== undefined) {
        const isFinished = finished === "1";
        filteredBooks = filteredBooks.filter(
          (book) => book.finished === isFinished
        );
      }

      // Format respon hanya dengan id, name, dan publisher
      const responseBooks = filteredBooks.map(({ id, name, publisher }) => ({
        id,
        name,
        publisher,
      }));

      return h.response({
        status: "success",
        data: {
          books: responseBooks,
        },
      });
    },
  });

  server.route({
    method: "GET",
    path: "/books/{bookId}",
    handler: (req, h) => {
      const { bookId } = req.params;
      const index = books.findIndex((b) => b.id === bookId);

      if (index === -1) {
        return h
          .response({
            status: "fail",
            message: "Buku tidak ditemukan",
          })
          .code(404);
      }

      return h
        .response({
          status: "success",
          data: {
            book: books[index],
          },
        })
        .code(200);
    },
  });

  //   put
  server.route({
    method: "PUT",
    path: "/books/{bookId}",
    handler: (request, h) => {
      const { bookId } = request.params;
      const {
        name,
        year,
        author,
        summary,
        publisher,
        pageCount,
        readPage,
        reading,
      } = request.payload;

      const index = books.findIndex((b) => b.id === bookId);

      if (!name) {
        return h
          .response({
            status: "fail",
            message: "Gagal memperbarui buku. Mohon isi nama buku",
          })
          .code(400);
      }

      if (readPage > pageCount) {
        return h
          .response({
            status: "fail",
            message:
              "Gagal memperbarui buku. readPage tidak boleh lebih besar dari pageCount",
          })
          .code(400);
      }

      if (index === -1) {
        return h
          .response({
            status: "fail",
            message: "Gagal memperbarui buku. Id tidak ditemukan",
          })
          .code(404);
      }

      const updatedAt = new Date().toISOString();
      books[index] = {
        ...books[index],
        name,
        year,
        author,
        summary,
        publisher,
        pageCount,
        readPage,
        reading,
        updatedAt,
      };

      return {
        status: "success",
        message: "Buku berhasil diperbarui",
      };
    },
  });

  //   delete
  server.route({
    method: "DELETE",
    path: "/books/{bookId}",
    handler: (request, h) => {
      const { bookId } = request.params;

      const index = books.findIndex((b) => b.id === bookId);

      if (index === -1) {
        return h
          .response({
            status: "fail",
            message: "Buku gagal dihapus. Id tidak ditemukan",
          })
          .code(404);
      }

      books.splice(index, 1);

      return {
        status: "success",
        message: "Buku berhasil dihapus",
      };
    },
  });

  await server.start();
  console.log(`Server berjalan pada ${server.info.uri}`);
};

init();
