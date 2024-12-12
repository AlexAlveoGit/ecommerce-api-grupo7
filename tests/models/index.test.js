describe("test models index.js", () => {
  it("should instantiate sequalize for no-test environments", () => {
    // Arrange
    process.env.NODE_ENV = "production";

    // Act
    const { sequelize } = require("../../models");

    // Assert
    expect(sequelize.options.dialect).toBe("sqlite");
    expect(sequelize.options.storage).toBe("./db.sqlite");
  });
});
