const { ApolloServer } = require("apollo-server");
const { GraphQLScalarType } = require("graphql");

const typeDefs = `
    scalar DateTime

    enum PhotoCategory {
      SELFIE
      PORTRAIT
      ACTION
      LANDSCAPE
      GRAPHIC
    }

    type Photo {
        id: ID!
        url: String!
        name: String!
        description: String
        category: PhotoCategory!
        postedBy: User!
        taggedUsers: [User!]!
        created: DateTime!
    }
    
    input PostPhotoInput {
      name: String!
      category: PhotoCategory=PORTRAIT
      description: String
    }

    type User {
      githubLogin: ID!
      name: String
      avatar: String
      postedPhotos: [Photo!]!
      inPhotos: [Photo!]!
    }

    type Query {
        totalPhotos: Int!
        allPhotos(after: DateTime): [Photo!]!
    }

    type Mutation {
        postPhoto(input: PostPhotoInput!): Photo!
    }
`;

var _id = 0;
var photos = [
  {
    id: '1',
    name: 'Dropping The Cake',
    description: '설명1',
    category: 'ACTION',
    githubUser: 'gPlake',
    created: "3-28-1977"
  },
  {
    id: '2',
    name: 'Dropping The Cake2',
    description: '설명2',
    category: 'SELFIE',
    githubUser: 'mHattrup',
    created: "1-2-1985"
  },
  {
    id: '3',
    name: 'Dropping The Cake3',
    description: '설명1',
    category: 'LANDSCAPE',
    githubUser: 'mHattrup',
    created: "2018-04-15T19:09:57.308Z"
  },
];
var users = [
  {
    githubLogin: 'mHattrup',
    name: 'Mike Hattrup'
  },
  {
    githubLogin: 'gPlake',
    name: 'Glen Plake'
  }
]

var tags = [
  { photoID: '1', userID: 'gPlake' },
  { photoID: '2', userID: 'mHattrup' },
  { photoID: '2', userID: 'gPlake' },
]

const resolvers = {
  Query: {
    totalPhotos: () => photos.length,
    allPhotos: () => photos,
  },

  Mutation: {
    postPhoto(parent, args) {
      var newPhoto = {
        id: _id++,
        ...args.input,
        created: new Date()
      };
      photos.push(newPhoto);

      return newPhoto;
    },
  },
  Photo: {
    url: (parent) => `http://naver.com/img/${parent.id}.jpg`,
    postedBy: parent => {
      return users.find(u => u.githubLogin === parent.githubUser)
    },
    taggedUsers: parent => tags
      .filter(tag => tag.photoID === parent.id)
      .map(tag => tag.userID)
      .map(userID => users.find(u => u.githubLogin === userID))
  },
  User: {
    postedPhotos: parent => {
      return photos.filter(p => p.githubUser === parent.githubLogin)
    },
    inPhotos: parent => tags
      .filter(tag => tag.userID === parent.id)
      .map(tag => tag.photoID)
      .map(photoID => photos.fimd(p => p.id === photoID))
  },
  DateTime: new GraphQLScalarType({
    name: 'DateTime',
    description: 'A valid date time value.',
    parseValue: value => new Date(value),
    serialize: value => new Date(value).toISOString(),
    parseLiteral: ast => ast.value
  })
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

server
  .listen()
  .then(({ url }) => console.log(`GraphQL Service running on ${url}`));
