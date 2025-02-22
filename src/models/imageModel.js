module.exports = (sequelize, DataTypes) => {
  const Image = sequelize.define(
    `image_sale_point`,
    {
      imageName: {
        type: DataTypes.STRING,
      },
      imageUrl: {
        type: DataTypes.STRING,
      },
    },
    {
      freezeTableName: true,
    }
  );

  return Image;
};
