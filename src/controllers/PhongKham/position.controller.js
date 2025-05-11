const ChucVu = require("../../model/ChucVu");
const { handleError } = require("../../utils/errorUtils");

// API lấy tất cả chức vụ
const fetchAllChucVu = async (req, res) => {
  try {
    const { page, limit, name } = req.query;

    const pageNumber = parseInt(page, 10) || 1;
    const limitNumber = parseInt(limit, 10) || 10;
    const skip = (pageNumber - 1) * limitNumber;

    const query = {};
    if (name) {
      query.name = { $regex: `.*${name}.*`, $options: "i" }; // Tìm kiếm theo tên
    }

    const fetchAll = await ChucVu.find(query).skip(skip).limit(limitNumber);
    const totalChucVu = await ChucVu.countDocuments(query);
    const totalPages = Math.ceil(totalChucVu / limitNumber);

    return res.status(200).json({
      data: fetchAll,
      totalChucVu,
      totalPages,
      currentPage: pageNumber,
      message: "Đã tìm ra tất cả chức vụ",
    });
  } catch (error) {
    handleError(res, error, "Có lỗi xảy ra khi lấy danh sách chức vụ.");
  }
};

// API tạo chức vụ
const createChucVu = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({
        message: "Vui lòng cung cấp đầy đủ thông tin (name)",
      });
    }

    // Kiểm tra tên chức vụ đã tồn tại
    const existingChucVu = await ChucVu.findOne({
      name: { $regex: new RegExp(`^${name}$`, "i") },
    });
    if (existingChucVu) {
      return res.status(409).json({
        message: "Tên chức vụ đã tồn tại. Vui lòng sử dụng tên khác.",
      });
    }

    const createChucVu = await ChucVu.create({ name, description });

    return res.status(200).json({
      data: createChucVu,
      message: "Thêm chức vụ thành công",
    });
  } catch (error) {
    handleError(res, error, "Có lỗi xảy ra khi tạo chức vụ.");
  }
};

// API cập nhật chức vụ
const updateChucVu = async (req, res) => {
  try {
    const { _id, name, description } = req.body;

    const updateChucVu = await ChucVu.updateOne({ _id }, { name, description });

    if (!updateChucVu) {
      return res.status(404).json({
        message: "Chỉnh sửa chức vụ thất bại.",
      });
    }

    return res.status(200).json({
      data: updateChucVu,
      message: "Chỉnh sửa chức vụ thành công",
    });
  } catch (error) {
    handleError(res, error, "Có lỗi xảy ra khi cập nhật chức vụ.");
  }
};

// API xóa chức vụ
const deleteChucVu = async (req, res) => {
  try {
    const { id } = req.params;

    const deleteChucVu = await ChucVu.deleteOne({ _id: id });

    if (!deleteChucVu) {
      return res.status(404).json({
        message: "Xóa chức vụ thất bại.",
      });
    }

    return res.status(200).json({
      data: deleteChucVu,
      message: "Xóa chức vụ thành công",
    });
  } catch (error) {
    handleError(res, error, "Có lỗi xảy ra khi xóa chức vụ.");
  }
};

module.exports = {
  fetchAllChucVu,
  createChucVu,
  updateChucVu,
  deleteChucVu,
};
