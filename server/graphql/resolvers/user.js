const User = require('../../models/User.js');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

module.exports = {
  Mutation: {
    async register(
      _,
      {
        registerInput: {
          firstName,
          lastName,
          emailAddress,
          phoneNumber,
          password,
          confirmPassword,
        },
      }
    ) {
      try {
        const userExists = await User.findOne({ emailAddress });
        if (userExists)
          throw new Error('Invalid email or password');

        if (password !== confirmPassword)
          throw new Error('Passwords do not match');

        const olympiasEmail = process.env.OLYMPIA_EMAIL_ADDRESS;
        const daniellesEmail = process.env.DANIELLE_EMAIL_ADDRESS;
        const gregsEmail = process.env.GREG_EMAIL_ADDRESS;

        if (
          emailAddress !== olympiasEmail &&
          emailAddress !== daniellesEmail &&
          emailAddress !== gregsEmail
        )
          throw new Error('Invalid email or password');

        const hashedPassword = await bcrypt.hash(password, 12);

        const token = jwt.sign(
          { emailAddress, user_type: 'ADMIN' },
          'secret_password',
          {
            expiresIn: '1hr',
          }
        );

        const createdUser = new User({
          firstName,
          lastName,
          emailAddress,
          phoneNumber,
          password: hashedPassword,
          isApproved: true,
          token,
          tokenExpiration: '',
          userType: 'ADMIN',
        });

        const res = await createdUser.save();
        return res;
      } catch (err) {
        throw new Error(err.message);
      }
    },
    async login(_, { loginInput: { emailAddress, password } }) {
      try {
        const user = await User.findOne({ emailAddress });

        if (!user)
          throw new Error('Incorrect email address or password');

        if (user && (await bcrypt.compare(password, user.password))) {
          const accessToken = jwt.sign(
            {
              user_id: user._id,
              first_name: user.firstName,
              last_name: user.lastName,
              email_address: emailAddress,
              user_type: user.userType,
              last_login_time: user?.lastLoginTime,
            },
            'secret_password',
            {
              expiresIn: '1hr',
            }
          );

          user.token = accessToken;

          return {
            id: user.id,
            ...user._doc,
          };
        } else {
          throw new Error('Incorrect email address or password');
        }
      } catch (err) {
        throw new Error(err.message);
      }
    },
    async getRefreshToken(_, args) {
      return {
        refreshToken: jwt.sign(
          { user_type: args.userType, first_name: args.firstName },
          'secret_password',
          {
            expiresIn: '1d',
          }
        ),
      };
    },
    logoutUser: async (_, { id }) => {
      const user = await User.findById(id);

      if (!user) throw new Error('User not found');

      user.lastLoginTime = new Date().toISOString();

      const savedUser = await user.save();

      return savedUser;
    },
  },
  Query: {
    async getUsers() {
      return await User.find({})
        .populate('address')
        .populate({
          path: 'newClientForm',
          model: 'NewClientForm',
          populate: {
            path: 'pets',
            model: 'Pet',
          },
        })
        .populate({
          path: 'newClientForm',
          model: 'NewClientForm',
          populate: {
            path: 'vet',
            model: 'Vet',
          },
        });
    },
    async getUserById(_, { id }) {
      return await User.findById(id)
        .populate('address')
        .populate({
          path: 'newClientForm',
          model: 'NewClientForm',
          populate: {
            path: 'pets',
            model: 'Pet',
          },
        })
        .populate({
          path: 'newClientForm',
          model: 'NewClientForm',
          populate: {
            path: 'vet',
            model: 'Vet',
          },
        });
    },
    async getUserByEmail(_, { emailAddress }) {
      try {
        if (emailAddress) {
          const user = await User.findOne({ emailAddress });
          if (user)
            throw new Error(
              `Looks like you've already set up an account with that email. Please call.`
            );

          return true;
        } else return false;
      } catch (err) {
        throw new Error(err.message);
      }
    },
  },
};
