'use strict';

exports.model = function(sequelize, DataTypes) {
    return sequelize.define('user', {
        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true
        },
        full_name: {
            type: DataTypes.STRING,
            allowNull: true
        },
        name: {
            type: DataTypes.STRING(16),
            allowNull: false
        },
        from: {
            type: DataTypes.STRING(32),
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false
        },
        status: {
            type: DataTypes.STRING(16),
            allowNull: true
        },
        email: {
            type: DataTypes.STRING(32),
            allowNull: true
        },
        mobile: {
            type: DataTypes.STRING(16),
            allowNull: true
        },
        phone: {
            type: DataTypes.STRING(32),
            allowNull: true
        }
    }, {
        underscored: false,
        tableName: 'user'
    });
};
