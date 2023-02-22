import ProjectModel from '../models/Project.js';
import ClientModel from '../models/Client.js';

import {
    GraphQLEnumType,
    GraphQLID,
    GraphQLList,
    GraphQLNonNull,
    GraphQLObjectType,
    GraphQLSchema,
    GraphQLString
} from 'graphql';

// Client type
const ClientType = new GraphQLObjectType({
    name: 'Client',
    fields: () => ({
        id: { type: GraphQLID },
        name: { type: GraphQLString },
        email: { type: GraphQLString },
        phone: { type: GraphQLString }
    })
});

// Project type
const ProjectType = new GraphQLObjectType({
    name: 'Project',
    fields: () => ({
        id: { type: GraphQLID },
        name: { type: GraphQLString },
        description: { type: GraphQLString },
        status: { type: GraphQLString },
        client: {
            type: ClientType,
            resolve(parent, args) {
                return ClientModel.findById(parent.clientId);
            }
        }
    })
});

// Root query
const RootQuery = new GraphQLObjectType({
    name: 'RootQueryType',
    fields: {
        clients: {
            type: new GraphQLList(ClientType),
            resolve(parent, args) {
                return ClientModel.find();
            }
        },
        client: {
            type: ClientType,
            args: { id: { type: GraphQLID } },
            resolve(parent, args) {
                return ClientModel.findById(args.id);
            }
        },
        projects: {
            type: new GraphQLList(ProjectType),
            resolve(parent, args) {
                return ProjectModel.find();
            }
        },
        project: {
            type: ProjectType,
            args: { id: { type: GraphQLID } },
            resolve(parent, args) {
                return ProjectModel.findById(args.id);
            }
        }
    }
});

// Mutations
const mutation = new GraphQLObjectType({
    name: 'Mutation',
    fields: {
        // Add a client
        addClient: {
            type: ClientType,
            args: {
                name: { type: GraphQLNonNull(GraphQLString) },
                email: { type: GraphQLNonNull(GraphQLString) },
                phone: { type: GraphQLNonNull(GraphQLString) }
            },
            resolve(parent, args) {
                const client = new ClientModel({
                    name: args.name,
                    email: args.email,
                    phone: args.phone
                });
                return client.save();
            }
        },
        // Delete a client
        deleteClient: {
            type: ClientType,
            args: {
                id: { type: GraphQLNonNull(GraphQLID) }
            },
            resolve(parent, args) {
                return ClientModel.findByIdAndRemove(args.id);
            }
        },
        // Add a project
        addProject: {
            type: ProjectType,
            args: {
                name: { type: GraphQLNonNull(GraphQLString) },
                description: { type: GraphQLNonNull(GraphQLString) },
                status: {
                    type: new GraphQLEnumType({
                        name: 'ProjectStatus',
                        values: {
                            new: { value: 'Not Started' },
                            progress: { value: 'In Progress' },
                            completed: { value: 'Completed' }
                        }
                    }),
                    defaultValue: 'Not Started'
                },
                clientId: { type: GraphQLNonNull(GraphQLID) }
            },
            resolve(parent, args) {
                const project = new ProjectModel({
                    name: args.name,
                    description: args.description,
                    status: args.status,
                    clientId: args.clientId
                });
                return project.save();
            }
        },
        // Delete a project
        deleteProject: {
            type: ProjectType,
            args: {
                id: { type: GraphQLNonNull(GraphQLID) }
            },
            resolve(parent, args) {
                return ProjectModel.findByIdAndRemove(args.id);
            }
        },
        // Update a project
        updateProject: {
            type: ProjectType,
            args: {
                id: { type: GraphQLNonNull(GraphQLID) },
                name: { type: GraphQLString },
                description: { type: GraphQLString },
                status: {
                    type: new GraphQLEnumType({
                        name: 'ProjectStatusUpdate',
                        values: {
                            new: { value: 'Not Started' },
                            progress: { value: 'In Progress' },
                            completed: { value: 'Completed' }
                        }
                    })
                }
            },
            resolve(parent, args) {
                return ProjectModel.findByIdAndUpdate(
                    args.id,
                    {
                        $set: {
                            name: args.name,
                            description: args.description,
                            status: args.status
                        }
                    },
                    {
                        new: true
                    }
                );
            }
        }
    }
});

const schema = new GraphQLSchema({
    query: RootQuery,
    mutation
});

export default schema;
