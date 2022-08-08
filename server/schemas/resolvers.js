const { User } = require('../models');

const { AuthenticationError } = require('apollo-server-express');
const { signToken } = require('../utils/auth');

const resolvers = {
    Query: {
        me: async (parent, args, context) => {
            if (context.user) {
                const userData = await User.findOne({ _id: context.user._id })
                    .select('__v -password');
                return userData;
            }
            throw new AuthenticationError('You are not logged in!')
        }
    },
    Mutation: {
        addUser: async (parent, args) => {
            const user = await User.create(args);
            const token = signToken(user);
            return { token, user };
        },
        login: async (parent, { email, password }) => {
            const user = await user.findOne({ email });

            if (!user) {
                throw new AuthenticationError('Incorrect email!');
            }

            const correctPw = await user.isCorrectPassword(password);

            if (!correctPw) {
                throw new AuthenticationError('Incorrect Password!')
            }

            const token = signToken(user);
            return { token, user };
        },
        saveBook: async (parent, {input}, context) => {
            if (context.user) {
                const addBooks = await User.findOneAndUpdate(
                    { _id: context.user._id },
                    { $addToSet: { savedBooks: input } },
                    { new: true }
                );

                return addBooks;
            }

            throw new AuthenticationError('You need to be logged in!');
        },
        removeBook: async (parent, args, context) => {
            if (context.user) {
                const removeBook = await User.findOneAndUpdate(
                    {_id: context.user._id},
                    { $pull: { savedBooks: {bookId: args.bookId} } },
                    { new: true }
                );

                return removeBook;
            }

            throw new AuthenticationError('You need to be logged in!');
        }
    }
};

module.exports = resolvers;