export default (req, res, next) => {
    return res.status(404).json({
        message: "route not found",
    });
};
