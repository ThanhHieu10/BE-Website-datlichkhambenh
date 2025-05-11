const ChuyenKhoa = require("../../model/ChuyenKhoa");
const { handleError } = require("../../utils/errorUtils");

// API lấy tất cả chuyên khoa
const fetchAllChuyenKhoa = async (req, res) => {
  try {
    const { page, limit, name } = req.query;

    const pageNumber = parseInt(page, 10) || 1;
    const limitNumber = parseInt(limit, 10) || 10;
    const skip = Math.max((pageNumber - 1) * limitNumber, 0);
    const query = {};

    if (name) {
      const searchKeywords = name.trim().split(/\s+/);
      const searchConditions = searchKeywords.map((keyword) => ({
        name: { $regex: keyword, $options: "i" },
      }));
      query.$or = searchConditions;
    }

    const fetchAll = await ChuyenKhoa.find(query).skip(skip).limit(limitNumber);
    const totalChuyenKhoa = await ChuyenKhoa.countDocuments(query);
    const totalPages = Math.ceil(totalChuyenKhoa / limitNumber);

    return res.status(200).json({
      data: fetchAll,
      totalChuyenKhoa,
      totalPages,
      currentPage: pageNumber,
      message: "Đã tìm ra tất cả chuyên khoa",
    });
  } catch (error) {
    handleError(res, error, "Có lỗi xảy ra khi lấy danh sách chuyên khoa.");
  }
};

// API lấy chi tiết chuyên khoa
const fetchChuyenKhoaByID = async (req, res) => {
  try {
    const { id } = req.query;

    const chuyenKhoa = await ChuyenKhoa.findById(id);

    if (!chuyenKhoa) {
      return res.status(404).json({ message: "Chuyên khoa không tồn tại!" });
    }

    return res.status(200).json({
      message: "Đã tìm thấy chuyên khoa",
      data: chuyenKhoa,
    });
  } catch (error) {
    handleError(res, error, "Có lỗi xảy ra khi lấy chi tiết chuyên khoa.");
  }
};

// API tạo chuyên khoa
const createChuyenKhoa = async (req, res) => {
  try {
    const { name, description, image } = req.body;

    const existingChuyenKhoa = await ChuyenKhoa.findOne({
      name: { $regex: new RegExp(`^${name}$`, "i") },
    });

    if (existingChuyenKhoa) {
      return res.status(409).json({
        message: "Tên chuyên khoa đã tồn tại. Vui lòng sử dụng tên khác.",
      });
    }

    if (!name) {
      return res.status(400).json({
        message: "Vui lòng cung cấp đầy đủ thông tin (tên chuyên khoa).",
      });
    }

    const createChuyenKhoa = await ChuyenKhoa.create({
      name,
      description,
      image,
    });

    return res.status(200).json({
      data: createChuyenKhoa,
      message: "Thêm chuyên khoa thành công",
    });
  } catch (error) {
    handleError(res, error, "Có lỗi xảy ra khi tạo chuyên khoa.");
  }
};

// API cập nhật chuyên khoa
const updateChuyenKhoa = async (req, res) => {
  try {
    const { _id, name, description, image } = req.body;

    const updateChuyenKhoa = await ChuyenKhoa.updateOne(
      { _id },
      { name, description, image }
    );

    if (!updateChuyenKhoa) {
      return res.status(404).json({
        message: "Chỉnh sửa chuyên khoa thất bại.",
      });
    }

    return res.status(200).json({
      data: updateChuyenKhoa,
      message: "Chỉnh sửa chuyên khoa thành công",
    });
  } catch (error) {
    handleError(res, error, "Có lỗi xảy ra khi cập nhật chuyên khoa.");
  }
};

// API xóa chuyên khoa
const deleteChuyenKhoa = async (req, res) => {
  try {
    const { id } = req.params;

    const deleteChuyenKhoa = await ChuyenKhoa.deleteOne({ _id: id });

    if (!deleteChuyenKhoa) {
      return res.status(404).json({
        message: "Xóa chuyên khoa thất bại.",
      });
    }

    return res.status(200).json({
      data: deleteChuyenKhoa,
      message: "Xóa chuyên khoa thành công",
    });
  } catch (error) {
    handleError(res, error, "Có lỗi xảy ra khi xóa chuyên khoa.");
  }
};

module.exports = {
  fetchAllChuyenKhoa,
  fetchChuyenKhoaByID,
  createChuyenKhoa,
  updateChuyenKhoa,
  deleteChuyenKhoa,
};
