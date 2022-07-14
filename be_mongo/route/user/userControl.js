const User = require("./../../models/Users/User");
const qrcode = require("qrcode");
const bcrypt = require("bcrypt");
const otplib = require("otplib");

const generateQRCode = async (otpAuth) => {
  try {
    const QRCodeImageUrl = await qrcode.toDataURL(otpAuth);
    return `<img src='${QRCodeImageUrl}' alt='qr-code-img-kiet' />`;
  } catch (error) {
    console.log("Could not generate QR code", error);
    return;
  }
};

const { authenticator } = otplib;
const generateUniqueSecret = () => {
  return authenticator.generateSecret();
};
/** Tạo mã OTP token */
const generateOTPToken = (username, serviceName, secret) => {
  return authenticator.keyuri(username, serviceName, secret);
};
/** Kiểm tra mã OTP token có hợp lệ hay không
 * Có 2 method "verify" hoặc "check", các bạn có thể thử dùng một trong 2 tùy thích.
 */
const verifyOTPToken = (token, secret) => {
  return authenticator.verify({ token, secret });
  // return authenticator.check(token, secret)
};

const postVerify2FA = async (req, res) => {
  try {
    const { otpToken, email } = req.body;
    const user = await User.findOne({ email: email });
    console.log("secret: " + user.secret);
    console.log("otpToken: " + otpToken);
    // Kiểm tra mã token người dùng truyền lên có hợp lệ hay không?
    const isValid = verifyOTPToken(otpToken, user.secret);

    if (isValid) {
      user.scaned = true;
      user.save();
      return res.status(200).json({ user });
    } else return res.status(200).json({ isValid });
  } catch (error) {
    return res.status(500).json(error);
  }
};

/* controller xử lý tạo mã otp và gửi về client dạng hình ảnh QR Code */
const postEnable2FA = async (req, res) => {
  try {
    let { email } = req.body;
    // đây là tên ứng dụng của các bạn, nó sẽ được hiển thị trên app Google Authenticator hoặc Authy sau khi bạn quét mã QR
    const serviceName = "kietttt";
    // Thực hiện tạo mã OTP
    const user = await User.findOne({ email: email });
    console.log(user);
    const otpAuth = generateOTPToken(user.name, serviceName, user.secret);
    // Tạo ảnh QR Code để gửi về client
    const QRCodeImage = await generateQRCode(otpAuth);
    return res.status(200).json({ QRCodeImage });
  } catch (error) {
    return res.status(500).json(error);
  }
};

// end

const createUser = async (req, res) => {
  const { info } = req.body;
  const user = new User(info);
  const check = await User.findOne({ email: info.email });
  if (check)
    return res.status(500).send({
      message: "User exist!",
    });
  else {
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
    user.secret = generateUniqueSecret();
    user.scaned = false;
    user
      .save()
      .then((w) => {
        res.send({ email: user.email });
      })
      .catch((e) => {
        console.log(e);
        res.status(500).send({
          message: "Something was wrong!",
        });
      });
  }
};

const login = async (req, res) => {
  const body = req.body;
  const user = await User.findOne({ email: body.email });
  if (user) {
    const validPassword = await bcrypt.compare(body.password, user.password);
    if (validPassword) {
      const copy = {
        _id: user.id,
        name: user.name,
        email: user.email,
        scaned: user.scaned,
      };
      res.send(copy);
    } else {
      res.status(401).json({ error: "Wrong password" });
    }
  } else {
    res.status(401).json({ error: "User does not exist" });
  }
};

const getAllUser = async (req, res) => {
  const user = await User.find();
  res.send(user);
};

const removeAllUser = async (req, res) => {
  const user = await User.remove();
  res.send("remove all");
};

module.exports = {
  getAllUser,
  createUser,
  login,
  postEnable2FA,
  removeAllUser,
  postVerify2FA,
};
