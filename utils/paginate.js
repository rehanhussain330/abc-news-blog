const paginate = async (model, query = {}, reqQuery = {}, options = {}) => {

    const { page = 1, limit = 5, sort = '-createdAt' } = reqQuery 

    const paginationOptions = {
        page: parseInt(page),
        limit: parseInt(limit),
        sort: options.sort || sort,
        ...options 
    }

    try{

        const result = await model.paginate(query, paginationOptions)
        
        return {
            data: result.docs,
            page: result.page,
            prevPage: result.prevPage,
            nextPage: result.nextPage,
            hasNextPage: result.hasNextPage,
            hasPrevPage:result.hasPrevPage,
            currentPage: result.page,
            counter: result.pagingCounter,
            limit: result.limit,
            totalDocs: result.totalDocs,
            totalPages: result.totalPages 
        }
    }catch(err){
        console.log('Pagination Error:', err.message)
    }

}

module.exports = paginate