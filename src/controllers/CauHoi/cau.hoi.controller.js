const CauHoi = require("../../model/CauHoi");
const Doctor = require("../../model/Doctor");
const { handleError } = require("../../utils/errorUtils");
const { paginate } = require("../../utils/paginationUtils");
const { sendEmail } = require("../../utils/emailUtils");
const { buildSearchQuery } = require("../../utils/searchUtils");

module.exports = {
  createCauHoi: async (req, res) => {
    try {
      const { email, firstName, lastName, chuyenKhoaId, cauHoi } = req.body;

      // Kiểm tra và tạo câu hỏi mới
      const newCauHoi = new CauHoi({
        email,
        firstName,
        lastName,
        chuyenKhoaId,
        cauHoi,
      });

      // Lưu câu hỏi vào database
      await newCauHoi.save();
      return res.status(201).json({
        message: "Thành công! Câu trả lời sẽ được gửi tới email của bạn!",
        data: newCauHoi,
      });
    } catch (error) {
      handleError(res, error, "Lỗi khi tạo câu hỏi");
    }
  },

  // Get câu hỏi theo bác sĩ
  getCauHoi: async (req, res) => {
    try {
      const { idDoctor, search, page, limit, sort, order } = req.query;

      let sortOrder = order === "desc" ? -1 : 1;

      // Tìm bác sĩ theo ID
      const doctor = await Doctor.findById(idDoctor);

      if (!doctor) {
        return res.status(404).json({ message: "Bác sĩ không tồn tại." });
      }

      // Get chuyên khoa của bác sĩ
      const chuyenKhoaId = doctor.chuyenKhoaId;

      const query = {
        chuyenKhoaId: { $in: chuyenKhoaId }, // $in để tìm các câu hỏi có chuyên khoa trùng
      };

      // Tìm kiếm theo từ khóa
      if (search) {
        Object.assign(query, buildSearchQuery(["cauHoi"], search));
      }

      // Tìm các câu hỏi có chuyên khoa trùng với chuyên khoa của bác sĩ
      const { skip, limit: limitNumber } = paginate(page, limit);

      const questions = await CauHoi.find(query)
        .skip(skip)
        .limit(limitNumber)
        .sort({ [sort]: sortOrder })
        .exec();

      // Lấy tổng số câu hỏi
      const totalQuestions = await CauHoi.countDocuments(query);

      // Tính tổng số trang
      const totalPages = Math.ceil(totalQuestions / limitNumber);

      if (questions.length > 0) {
        return res.status(200).json({
          message: "Tìm thấy câu hỏi.",
          data: questions,
          totalQuestions,
          totalPages,
          currentPage: page,
        });
      } else {
        return res
          .status(404)
          .json({ message: "Không có câu hỏi nào thuộc chuyên khoa này." });
      }
    } catch (error) {
      handleError(res, error, "Lỗi khi lấy câu hỏi");
    }
  },

  traLoiCauHoi: async (req, res) => {
    try {
      const {
        _id,
        cauTraLoi,
        cauHoi,
        status,
        email,
        firstName,
        lastName,
        idDoctor,
      } = req.body;

      // Cập nhật câu hỏi
      const update = await CauHoi.findByIdAndUpdate(
        { _id: _id },
        { cauTraLoi, cauHoi, status, doctors: idDoctor },
        { new: true }
      );

      if (update) {
        // Tạo nội dung email
        const mailOptions = {
          from: "Bác sĩ",
          to: email,
          subject: "Trả lời câu hỏi của bạn",
          html: `
            <html>
              <body>
                <h2>Chào ${firstName} ${lastName},</h2>
                <p><strong>Câu hỏi của bạn:</strong> ${cauHoi}</p>
                <p><strong>Câu trả lời:</strong> ${cauTraLoi}</p>
                <p><strong>Trạng thái:</strong> ${
                  status ? "Đã trả lời" : "Chưa trả lời"
                }</p>
              </body>
            </html>`,
        };

        // Gửi email
        await sendEmail(mailOptions);

        return res.status(200).json({
          data: update,
          message:
            "Trả lời câu hỏi cho bệnh nhân thành công và email đã được gửi",
        });
      } else {
        return res.status(404).json({
          message: "Trả lời câu hỏi cho bệnh nhân thất bại",
        });
      }
    } catch (error) {
      handleError(res, error, "Lỗi khi trả lời câu hỏi");
    }
  },

  getAllCauHoi: async (req, res) => {
    try {
      const { page, limit, order, sort, locTheoChuyenKhoa } = req.query;

      const { skip, limit: limitNumber } = paginate(page, limit);

      let query = {};

      if (locTheoChuyenKhoa) {
        const locTheoChuyenKhoaArray = Array.isArray(locTheoChuyenKhoa)
          ? locTheoChuyenKhoa
          : JSON.parse(locTheoChuyenKhoa);

        query.chuyenKhoaId = { $in: locTheoChuyenKhoaArray }; // $in lọc theo mảng các ObjectId
      }

      // Tìm các câu hỏi đã có câu trả lời
      query.cauTraLoi = { $ne: null };
      query.status = true;

      let sortOrder = order === "desc" ? -1 : 1;

      const cauHoi = await CauHoi.find(query)
        .skip(skip)
        .limit(limitNumber)
        .populate("chuyenKhoaId doctors")
        .populate({
          path: "doctors",
          model: "Doctor",
          populate: {
            path: "chucVuId",
            model: "ChucVu",
          },
        })
        .sort({ [sort]: sortOrder });

      if (cauHoi) {
        return res.status(200).json({
          message: "Tìm thấy all câu hỏi.",
          data: cauHoi,
        });
      } else {
        return res.status(404).json({ message: "Không có câu hỏi nào" });
      }
    } catch (error) {
      handleError(res, error, "Lỗi khi lấy câu hỏi");
    }
  },
};
