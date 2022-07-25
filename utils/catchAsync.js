module.exports = func => {
    return (req, res, next) => {
        console.log('------------------------------')
        console.log('hitting catch async function')
        console.log('------------------------------')
        func(req, res, next).catch(next);
    }
}