module.exports = (sequelize, DataTypes) => {
    const Menu = sequelize.define(
      `menu`,
      {
        menuId: {
          type: DataTypes.STRING,
          field:'menu_id'
        },
        menuName: {
          type: DataTypes.STRING,
          field:'nemu_name'
        },
      },
      {
        freezeTableName: true,
      }
    );
  
    return Menu;
  };