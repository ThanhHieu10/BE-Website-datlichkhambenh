const PhongKham = require("../../model/PhongKham");
const KhamBenh = require("../../model/KhamBenh");
const { handleError } = require("../../utils/errorUtils");
const { sendAppointmentEmail } = require("../../utils/emailUtils");

// API lấy tất cả phòng khám
const fetchAllPhongKham = async (req, res) => {
  try {
    const { page, limit, name, address } = req.query;

    const pageNumber = parseInt(page, 10) || 1;
    const limitNumber = parseInt(limit, 10) || 10;
    const skip = (pageNumber - 1) * limitNumber;

    const query = {};
    if (name || address) {
      const searchKeywords = (name || "") + " " + (address || "");
      const keywordsArray = searchKeywords.trim().split(/\s+/);

      const searchConditions = keywordsArray.map((keyword) => ({
        $or: [
          { name: { $regex: keyword, $options: "i" } },
          { address: { $regex: keyword, $options: "i" } },
        ],
      }));

      query.$or = searchConditions;
    }

    const fetchAll = await PhongKham.find(query).skip(skip).limit(limitNumber);
    const totalPhongKham = await PhongKham.countDocuments(query);
    const totalPages = Math.ceil(totalPhongKham / limitNumber);

    return res.status(200).json({
      data: fetchAll,
      totalPhongKham,
      totalPages,
      currentPage: pageNumber,
      message: "Đã tìm ra tất cả phòng khám",
    });
  } catch (error) {
    handleError(res, error, "Có lỗi xảy ra khi lấy danh sách phòng khám.");
  }
};

// API lấy chi tiết phòng khám
const fetchPhongKhamByID = async (req, res) => {
  try {
    const { id } = req.query;

    const phongKham = await PhongKham.findById(id);

    if (!phongKham) {
      return res.status(404).json({ message: "Phòng khám không tồn tại!" });
    }

    return res.status(200).json({
      message: "Đã tìm thấy phòng khám",
      data: phongKham,
    });
  } catch (error) {
    handleError(res, error, "Có lỗi xảy ra khi lấy chi tiết phòng khám.");
  }
};

// API tạo phòng khám
const createPhongKham = async (req, res) => {
  try {
    const { name, address, description, image, sdtPK } = req.body;

    if (!name || !address) {
      return res.status(400).json({
        message:
          "Vui lòng cung cấp đầy đủ thông tin (tên phòng khám, địa chỉ).",
      });
    }

    const createPhongKham = await PhongKham.create({
      name,
      address,
      description,
      image,
      sdtPK,
    });

    return res.status(200).json({
      data: createPhongKham,
      message: "Thêm phòng khám thành công",
    });
  } catch (error) {
    handleError(res, error, "Có lỗi xảy ra khi tạo phòng khám.");
  }
};

// API cập nhật phòng khám
const updatePhongKham = async (req, res) => {
  try {
    const { _id, name, address, description, image, sdtPK } = req.body;

    const updatePhongKham = await PhongKham.updateOne(
      { _id },
      { name, address, description, image, sdtPK }
    );

    if (!updatePhongKham) {
      return res.status(404).json({
        message: "Cập nhật phòng khám thất bại.",
      });
    }

    return res.status(200).json({
      data: updatePhongKham,
      message: "Cập nhật phòng khám thành công",
    });
  } catch (error) {
    handleError(res, error, "Có lỗi xảy ra khi cập nhật phòng khám.");
  }
};

// API xóa phòng khám
const deletePhongKham = async (req, res) => {
  try {
    const { id } = req.params;

    const deletePhongKham = await PhongKham.deleteOne({ _id: id });

    if (!deletePhongKham) {
      return res.status(404).json({
        message: "Xóa phòng khám thất bại.",
      });
    }

    return res.status(200).json({
      data: deletePhongKham,
      message: "Xóa phòng khám thành công",
    });
  } catch (error) {
    handleError(res, error, "Có lỗi xảy ra khi xóa phòng khám.");
  }
};

module.exports = {
  fetchAllPhongKham,
  fetchPhongKhamByID,
  createPhongKham,
  updatePhongKham,
  deletePhongKham,
};
