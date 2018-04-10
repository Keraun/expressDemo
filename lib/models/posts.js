'use strict';

exports.model = function(sequelize, DataTypes) {
    return sequelize.define('posts', {
        post_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true
        },
        title: {
            type: DataTypes.STRING,
            allowNull: false
        },
        time: {
            type: DataTypes.STRING,
            allowNull: true
        },
        author: {
            type: DataTypes.STRING,
            allowNull: true
        },
        content: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        status: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        markdown: {
            type: DataTypes.TEXT,
            allowNull: true
        }
    }, {
        underscored: false,
        tableName: 'posts'
    });
};
