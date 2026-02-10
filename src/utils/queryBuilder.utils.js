export const queryBuilder = ({ baseFilters = {}, query = {}, searchableFields = [], defaultSort = "-createdAt" }) => {
    const { search, sort = defaultSort, limit = 10, page = 1 } = query
    const filters = { ...baseFilters }

    if (search && searchableFields.length) {
        filters.$or = searchableFields.map(field => {
            return { [field]: { $regex: search, $options: "i" } }
        })
    }

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, parseInt(limit));
    const skip = (pageNum - 1) * limitNum;

    const sortBy = sort.split(",").join(" ");

    return { filters, sort: sortBy, limit: limitNum, page: pageNum, skip }
}