'use strict';

exports.model = function(sequelize, DataTypes) {
    return sequelize.define('posts', {
        post_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true
        },
        author: {
            type: DataTypes.STRING,
            allowNull: true
        },
        content: {
            type: DataTypes.STRING,
            allowNull: true
        }
    }, {
        underscored: false,
        tableName: 'posts'
    });
};
