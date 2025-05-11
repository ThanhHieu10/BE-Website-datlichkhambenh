const Doctor = require("../../model/Doctor");
const BenhNhan = require("../../model/BenhNhan");
const { hashPassword } = require("../../utils/passwordUtils");
const { sendEmail } = require("../../utils/emailUtils");
const { handleError } = require("../../utils/errorUtils");

require("dotenv").config();

module.exports = {
  // Quên mật khẩu - trả mật khẩu về email tài khoản bác sĩ
  quenMatKhauDoctor: async (req, res) => {
    const { email_doimk } = req.body;
    console.log("email đổi mk: ", email_doimk);

    try {
      // Kiểm tra xem tài khoản có tồn tại không
      const tk_doimk = await Doctor.findOne({ email: email_doimk });

      if (!tk_doimk) {
        console.log("Không tồn tại tài khoản");
        return res.status(404).json({
          message:
            "Không tồn tại tài khoản! Vui lòng kiểm tra lại email của bạn.",
          data: false,
        });
      }

      // Tạo mật khẩu ngẫu nhiên
      const newPassword = Math.random().toString(36).slice(-6);

      // Mã hóa mật khẩu mới
      const hashedPassword = await hashPassword(newPassword);

      // Lưu mật khẩu đã mã hóa vào cơ sở dữ liệu
      tk_doimk.password = hashedPassword;
      await tk_doimk.save();

      // Cấu hình email
      const mailOptions = {
        from: "Admin",
        to: email_doimk,
        subject: "Yêu cầu lấy lại mật khẩu",
        text: `Mật khẩu mới của bạn là: ${newPassword}`,
        html: `
          <p style="color: green;">Mật khẩu mới của bạn là: <strong>${newPassword}</strong></p>
          <p>Vui lòng đăng nhập với mật khẩu mới này để tiếp tục sử dụng dịch vụ.</p>
        `,
      };

      // Gửi email
      await sendEmail(mailOptions);

      console.log("Email sent");
      return res.status(200).json({
        data: true,
        message: `Mật khẩu mới đã được gửi tới email của bạn. Vui lòng kiểm tra email ${email_doimk} để lấy lại mật khẩu!`,
      });
    } catch (error) {
      handleError(res, error, "Lỗi trong quá trình xử lý quên mật khẩu");
    }
  },

  // Quên mật khẩu - trả mật khẩu về email tài khoản bệnh nhân
  quenMatKhauBN: async (req, res) => {
    const { email_doimk } = req.body;
    console.log("email đổi mk: ", email_doimk);

    try {
      // Kiểm tra tài khoản có tồn tại không
      const tk_doimk = await BenhNhan.findOne({ email: email_doimk });

      if (!tk_doimk) {
        console.log("Không tồn tại tài khoản");
        return res.status(404).json({
          message:
            "Không tồn tại tài khoản! Vui lòng kiểm tra lại email của bạn.",
          data: false,
        });
      }

      // Tạo mật khẩu ngẫu nhiên
      const newPassword = Math.random().toString(36).slice(-6);

      // Mã hóa mật khẩu mới
      const hashedPassword = await hashPassword(newPassword);

      // Lưu mật khẩu đã mã hóa vào cơ sở dữ liệu
      tk_doimk.password = hashedPassword;
      await tk_doimk.save();

      // Cấu hình email
      const mailOptions = {
        from: "Admin",
        to: email_doimk,
        subject: "Yêu cầu lấy lại mật khẩu",
        text: `Mật khẩu mới của bạn là: ${newPassword}`,
        html: `
          <p style="color: green;">Mật khẩu mới của bạn là: <strong>${newPassword}</strong></p>
          <p>Vui lòng đăng nhập với mật khẩu mới này để tiếp tục sử dụng dịch vụ.</p>
        `,
      };

      // Gửi email
      await sendEmail(mailOptions);

      console.log("Email sent");
      return res.status(200).json({
        data: true,
        message: `Mật khẩu mới đã được gửi tới email của bạn. Vui lòng kiểm tra email ${email_doimk} để lấy lại mật khẩu!`,
      });
    } catch (error) {
      handleError(res, error, "Lỗi trong quá trình xử lý quên mật khẩu");
    }
  },
};
