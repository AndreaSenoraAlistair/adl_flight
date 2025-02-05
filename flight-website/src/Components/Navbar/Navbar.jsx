import './Navbar.css'

const Navbar = () => {
    return (
        <div className='nav'>
            <div className="nav-logo">SkyConnect</div>
            <ul className="nav-menu">
                <li>Meals</li>
                <li>Movies</li>
                <li>Moments</li>
                <li className='nav-home'>Home</li>
            </ul>
        </div>
    )
}

export default Navbar;