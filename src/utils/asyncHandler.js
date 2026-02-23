export const asyncHandler = (fn) => (req, res, next) => {
    return (req, res, next) => {
        try {
            return Promis.resolve(fn(req, res, next)).catch(next);
        } catch (error) {
            next(error);
        }
    }
}