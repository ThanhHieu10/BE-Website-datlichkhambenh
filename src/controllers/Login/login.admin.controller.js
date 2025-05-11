const bcrypt = require("bcrypt");
const AccAdmin = require("../../model/AccAdmin");
const { handleError } = require("../../utils/errorUtils");
const { generateToken } = require("../../utils/jwtUtils");
const { setCookie, clearCookie } = require("../../utils/cookieUtils");
require("dotenv").config();

module.exports = {
  loginAccAdmin: async (req, res) => {
    const { email, password } = req.body;

    try {
      // Tìm admin bằng email
      const admin = await AccAdmin.findOne({ email });
      if (!admin) {
        return res.status(401).json({ message: "Email không tồn tại" });
      }

      // So sánh mật khẩu
      const isMatch = await bcrypt.compare(password, admin.password);
      if (!isMatch) {
        return res.status(401).json({ message: "Mật khẩu không chính xác" });
      }

      // Tạo token JWT
      const token = generateToken(
        { adminId: admin._id, email: admin.email },
        process.env.JWT_SECRET,
        { expiresIn: process.env.EXPIRESIN }
      );

      // Lưu token vào cookie
      setCookie(res, "token", token, { maxAge: parseInt(process.env.MAXAGE) });

      // Trả thông tin admin
      res.json({
        message: "Đăng nhập thành công",
        access_token: token,
        data: admin,
      });
      console.log(`Đăng nhập thành công với token: ${token}`);
    } catch (error) {
      handleError(res, error, "Lỗi khi đăng nhập");
    }
  },

  logoutAdmin: async (req, res) => {
    try {
      // Xóa cookie chứa token
      clearCookie(res, "token");

      // Trả về phản hồi thành công
      res.status(200).json({ message: "Đăng xuất thành công" });
    } catch (error) {
      handleError(res, error, "Lỗi khi đăng xuất");
    }
  },

  registerAccAdmin: async (req, res) => {
    const { email, password, firstName, lastName, address, phone, gender } =
      req.body;

    try {
      // Kiểm tra email đã tồn tại
      const check = await AccAdmin.findOne({ email: email });
      if (check) {
        return res.status(400).json({
          success: false,
          message: "Tài Khoản Đã Tồn Tại! Vui Lòng Chọn Email Khác!",
        });
      }

      // Hash mật khẩu
      const hashedPassword = await bcrypt.hash(password, 10);

      // Tạo tài khoản admin mới
      const dangKy = await AccAdmin.create({
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
};
