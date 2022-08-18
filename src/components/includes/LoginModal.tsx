import React, { Dispatch, SetStateAction, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { Icon } from 'semantic-ui-react';
import { app, firestore } from '../../firebase';
import { userUpload } from '../../firebasefunctions/user';
import { clearNotifications } from '../../firebasefunctions/notifications';
import userIcon from '../../media/userIcon.svg'
import lockIcon from '../../media/lockIcon.svg'
import QMILogo2020 from '../../media/QMILogo2020.svg';

type Props = {
    showLoginModal: boolean;
    setShowLoginModal: Dispatch<SetStateAction<boolean>>;
};

const LoginModal = ({
    showLoginModal,
    setShowLoginModal
}: Props) => {
    const history = useHistory();
    const isShown = showLoginModal ? 'Visible' : '';

    const closeModal = () => {
        setShowLoginModal(false);
    };
    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });

    // onchange for form
    const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const passLogin = (e: React.FormEvent<HTMLElement>) => {
        e.preventDefault();
        app.auth().signInWithEmailAndPassword(formData.email, formData.password).then((response) => {
            const user = response.user;
            userUpload(user, firestore);
            clearNotifications(user);
            history.push('/');
        }).catch(() => {
        });
    }

    return (
        <>
            {showLoginModal && (<div className="login__background">
                <div className={'login__block' + isShown}>
                    <button
                        type='button'
                        className='closeButton'
                        onClick={closeModal}
                    >     <Icon name='x' />
                    </button>
                    <img src={QMILogo2020} className="login__logo" alt="New QMI Logo" />
                    {/* Block containing the form and functionality of the login page */}
                    <div className="login__container">
                        <form action="" className="login__form" onSubmit={e => passLogin(e)}>
                            <div className="login__formsContainer">
                                <div className="form-group">
                                    <img src={userIcon} alt="An outline of a person" className='login__icon' />
                                    <input
                                        className="form-input"
                                        id="loginEmail"
                                        type="text"
                                        name="email"
                                        onChange={(e) => onChange(e)}
                                        required
                                        value={formData.email}
                                    />
                                    <>{ /* eslint-disable-next-line jsx-a11y/label-has-associated-control */}</>
                                    <label>Email Address</label>

                                </div>
                                <div className="form-group">
                                    <img src={lockIcon} alt="A lock" className='login__icon login__iconLock' />
                                    <input
                                        className="form-input pass"
                                        id="loginPassword"
                                        type="password"
                                        name="password"
                                        onChange={(e) => onChange(e)}
                                        value={formData.password}
                                        required
                                    />
                                    <>{ /* eslint-disable-next-line jsx-a11y/label-has-associated-control */}</>
                                    <label>Password</label>
                                </div>
                            </div>
                            <input
                                type="submit"
                                id="loginSubmit"
                                className=" login-button"
                                value="Login"
                            />
                        </form>
                    </div>
                </div>
            </div>)}
        </>
    );
};

export default LoginModal;
