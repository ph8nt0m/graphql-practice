const { ApolloServer } = require("apollo-server");

const typeDefs = `
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
    }

    type Query {
        totalPhotos: Int!
        allPhotos: [Photo!]!
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
    githubUser: 'gPlake'
  },
  {
    id: '2',
    name: 'Dropping The Cake2',
    description: '설명2',
    category: 'SELFIE',
    githubUser: 'mHattrup'
  },
  {
    id: '3',
    name: 'Dropping The Cake3',
    description: '설명1',
    category: 'LANDSCAPE',
    githubUser: 'mHattrup'
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
      };
      photos.push(newPhoto);

      return newPhoto;
    },
  },
  Photo: {
    url: (parent) => `http://naver.com/img/${parent.id}.jpg`,
    postedBy: parent => {
      return users.find(u => u.githubLogin === parent.githubUser)
    }
  },
  User: {
    postedPhotos: parent => {
      return photos.filter(p => p.githubUser === parent.githubLogin)
    }
  }
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

server
  .listen()
  .then(({ url }) => console.log(`GraphQL Service running on ${url}`));
