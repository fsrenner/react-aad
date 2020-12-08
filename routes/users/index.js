const router = require('express').Router();
const {
    getUsers,
    getUser,
    getUserIds,
    addUser,
    updateUser,
    deleteUser
} = require('../../controllers/UserController');

router.get('/', getUsers);
router.get('/id', getUserIds);
router.get('/:id', getUser);
router.post('/', addUser);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);

module.exports = router;