const BenhNhan = require("../../model/BenhNhan");
const { hashPassword, comparePassword } = require("../../utils/passwordUtils");
const { generateToken } = require("../../utils/jwtUtils");
const { setCookie, clearCookie } = require("../../utils/cookieUtils");
const { handleError } = require("../../utils/errorUtils");
const { paginate } = require("../../utils/paginationUtils");
const { buildSearchQuery } = require("../../utils/searchUtils");

require("dotenv").config();

module.exports = {
  loginBenhNhan: async (req, res) => {
    const { email, password } = req.body;

    try {
      // Tìm bệnh nhân bằng email
      const user = await BenhNhan.findOne({ email });
      if (!user) {
        return res.status(401).json({ message: "Email không tồn tại" });
      }

      // So sánh mật khẩu
      const isMatch = await comparePassword(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ message: "Mật khẩu không chính xác" });
      }

      // Tạo token JWT
      const token = generateToken(
        { benhNhanId: user._id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: process.env.EXPIRESIN }
      );

      // Lưu token vào cookie
      setCookie(res, "token", token, { maxAge: parseInt(process.env.MAXAGE) });

      // Trả về thông tin bệnh nhân
      res.json({
        message: "Đăng nhập thành công",
        access_token: token,
        data: user,
      });
    } catch (error) {
      handleError(res, error, "Lỗi khi đăng nhập");
    }
  },

  logoutBenhNhan: async (req, res) => {
    try {
      // Xóa cookie chứa token
      clearCookie(res, "token");

      // Trả về phản hồi thành công
      res.status(200).json({ message: "Đăng xuất thành công" });
    } catch (error) {
      handleError(res, error, "Lỗi khi đăng xuất");
    }
  },

  registerBenhNhan: async (req, res) => {
    const { email, password, firstName, lastName, address, phone, gender } =
      req.body;

    try {
      const check = await BenhNhan.findOne({ email: email });
      if (check) {
        return res.status(400).json({
          success: false,
          message: "Tài Khoản Đã Tồn Tại! Vui Lòng Chọn Email Khác!",
        });
      }

      // Hash mật khẩu
      const hashedPassword = await hashPassword(password);

      // Tạo tài khoản bệnh nhân mới
      const dangKy = await BenhNhan.create({
        email,
        password: hashedPassword,
        firstName,
        lastName,
        address,
        phone,
        gender,
      });

      return res.status(201).json({
        success: true,
        message: "Đăng ký tài khoản thành công",
        data: dangKy,
      });
    } catch (error) {
      handleError(res, error, "Lỗi khi đăng ký tài khoản");
    }
  },

  getAccKH: async (req, res) => {
    try {
      const { page, limit, tenKH } = req.query;

      const { skip, limit: limitNumber } = paginate(page, limit);

      const query = {};
      if (tenKH) {
        Object.assign(
          query,
          buildSearchQuery(
            ["email", "firstName", "lastName", "phone", "address"],
            tenKH
          )
        );
      }

      const bn = await BenhNhan.find(query)
        .populate("roleId")
        .skip(skip)
        .limit(limitNumber);

      const totalBenhNhan = await BenhNhan.countDocuments(query);
      const totalPages = Math.ceil(totalBenhNhan / limitNumber);

      if (bn) {
        return res.status(200).json({
          message: "Đã tìm thấy tài khoản khách hàng",
          errCode: 0,
          data: bn,
          totalKH: totalBenhNhan,
          totalPages,
          currentPage: parseInt(page, 10),
        });
      } else {
        return res.status(404).json({
          message: "Không tìm thấy tài khoản khách hàng",
          errCode: -1,
        });
      }
    } catch (error) {
      handleError(res, error, "Lỗi khi lấy danh sách tài khoản khách hàng");
    }
  },

  doiThongTinKH: async (req, res) => {
    const {
      _idAcc,
      email,
      lastName,
      firstName,
      address,
      phone,
      passwordMoi,
      image,
    } = req.body;

    try {
      // Hash mật khẩu mới
      const hashedPassword = await hashPassword(passwordMoi);

      // Cập nhật thông tin tài khoản
      const updateResult = await BenhNhan.updateOne(
        { _id: _idAcc },
        {
          email,
          lastName,
          firstName,
          address,
          phone,
          password: hashedPassword,
          image,
        }
      );

      if (updateResult.modifiedCount > 0) {
        return res.status(200).json({
          message: "Cập nhật tài khoản khách hàng thành công!",
          data: updateResult,
        });
      } else {
        return res.status(404).json({
          message: "Chỉnh sửa thất bại",
        });
      }
    } catch (error) {
      handleError(res, error, "Lỗi khi cập nhật thông tin tài khoản");
    }
  },

  deleteKH: async (req, res) => {
    try {
      const id = req.params.id;

      const xoa = await BenhNhan.deleteOne({ _id: id });
      if (xoa) {
        return res.status(200).json({
          data: xoa,
          message: "Bạn đã xóa tài khoản khách hàng thành công!",
        });
      } else {
        return res.status(404).json({
          message: "Xóa tài khoản khách hàng thất bại!",
        });
      }
    } catch (error) {
      handleError(res, error, "Lỗi khi xóa tài khoản khách hàng");
    }
  },
};
