import React, { useState, useEffect, useRef, useContext } from "react";
import styles from "../styles/contacts.module.css";
import { MdMessage } from "react-icons/md";
import { BiSearchAlt } from "react-icons/bi";
import { ContactsContext } from "../Context/contactsContext";
import openSocket from "socket.io-client";
import { User } from "../interfaces/User";
import { useSelector } from "react-redux";
import { Redux } from "../interfaces/Redux";

const Main = () => {
  const [hideIcon, setHideIcon] = useState<boolean>(false);
  const [hideMenu, setHideMenu] = useState<boolean>(true);
  const [newChat, setNewChat] = useState<boolean>(false);
  // const { contacts, setContacts } = useContext(ContactsContext);
  const contacts = useSelector<Redux>(state => state.user) as Redux["user"];
  // console.log("test", test);
  const menuRef = useRef(null);
  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleClickOutside = (e: Event) => {
    // @ts-ignore
    if (menuRef && menuRef.current && !menuRef.current?.contains(e.target)) {
      setHideMenu(true);
    }
  };
  return (
    <div className={`${styles.container} ${newChat && styles.newChat_show}`}>
      <div className={`${styles.newChat}`}>
        <div className={`${styles.profile} ${styles.fixed}`}>
          <img className={styles.profile_img} src="portitem1.jpeg" alt="" />
          <div className={styles.header_icons}>
            <MdMessage
              size="30px"
              className={styles.MdMessage}
              onClick={() => setNewChat(chat => !chat)}
            />
            <div
              className={`${styles.icon_box} ${
                !hideMenu && styles.icon_box_color
              }`}
              onClick={() => setHideMenu(hide => !hide)}
            >
              <div className={styles.select_icon}></div>
              <div className={styles.select_icon}></div>
              <div className={styles.select_icon}></div>
            </div>
          </div>
        </div>
        <div className={`${styles.profile}`}>
          <div
            ref={menuRef}
            className={`${styles.box} ${hideMenu && styles.hideMenu}`}
          ></div>
        </div>
        <div className={styles.profile}>
          <input
            type="text"
            className={styles.input}
            placeholder="Search Contact"
            onChange={() => setHideIcon(true)}
            onMouseLeave={() => setHideIcon(false)}
          />
          <BiSearchAlt
            className={`${styles.BiSearchAlt} ${hideIcon && styles.hide_icon}`}
          />
        </div>
        {contacts &&
          contacts?.length !== 0 &&
          contacts.map(({ firstName, lastName, createdAt, status, _id }) => (
            <div className={styles.profile} key={_id}>
              <img className={styles.profile_img} src="portitem1.jpeg" alt="" />
              <div className={styles.user}>
                <div className={styles.user_header}>
                  <h2>
                    {firstName} {lastName}
                  </h2>
                  <p>{new Date(createdAt).toLocaleString()} </p>
                </div>
                <p>{status}</p>
              </div>
            </div>
          ))}
      </div>
      <div className={`${styles.profile} ${styles.fixed}`}>
        <img className={styles.profile_img} src="portitem1.jpeg" alt="" />
        <div className={styles.header_icons}>
          <MdMessage
            size="30px"
            className={styles.MdMessage}
            onClick={() => setNewChat(chat => !chat)}
          />
          <div
            className={`${styles.icon_box} ${
              !hideMenu && styles.icon_box_color
            }`}
            onClick={() => setHideMenu(hide => !hide)}
          >
            <div className={styles.select_icon}></div>
            <div className={styles.select_icon}></div>
            <div className={styles.select_icon}></div>
          </div>
        </div>
      </div>
      <div className={`${styles.profile}`}>
        <div
          ref={menuRef}
          className={`${styles.box} ${hideMenu && styles.hideMenu}`}
        >
          <div>
            <p>New Gruop</p>
          </div>
          <div>
            <p>Profile</p>
          </div>
          <div>
            <p>box</p>
          </div>
          <div>
            <p>box</p>
          </div>
          <div>
            <p>box</p>
          </div>
          <div>
            <p>box</p>
          </div>
        </div>
      </div>
      <div className={styles.profile}>
        <input
          type="text"
          className={styles.input}
          placeholder="Search or start a new chat"
          onChange={() => setHideIcon(true)}
          onMouseLeave={() => setHideIcon(false)}
        />
        <BiSearchAlt
          className={`${styles.BiSearchAlt} ${hideIcon && styles.hide_icon}`}
        />
      </div>
      <div className={styles.profile}>
        <img className={styles.profile_img} src="portitem1.jpeg" alt="" />
        <div className={styles.user}>
          <div className={styles.user_header}>
            <h2>contact</h2>
            <p>2:11</p>
          </div>
          <p>
            Lorem ipsum dolor sit amet, consectetur adipisicing elit. Iusto,
            perferendis! Lorem ipsum dolor sit amet, consectetur adipisicing
            elit. Consequuntur cum iusto consequatur maiores placeat quam autem,
            sit beatae impedit molestias modi eveniet ducimus qui voluptatem
            veniam recusandae, obcaecati, delectus error sed illo incidunt ex
            repellat sapiente. Voluptate, tenetur nobis magni alias et ad ipsa
            obcaecati consequuntur deleniti, incidunt suscipit a?
          </p>
        </div>
      </div>
      <div className={styles.profile}>
        <img className={styles.profile_img} src="portitem1.jpeg" alt="" />
        <div className={styles.user}>
          <div className={styles.user_header}>
            <h2>contact</h2>
            <p>2:11</p>
          </div>
          <p>
            Lorem ipsum dolor sit amet, consectetur adipisicing elit. Iusto,
            perferendis!
          </p>
        </div>
      </div>
      <div className={styles.profile}>
        <img className={styles.profile_img} src="portitem1.jpeg" alt="" />
        <div className={styles.user}>
          <div className={styles.user_header}>
            <h2>contact</h2>
            <p>2:11</p>
          </div>
          <p>
            Lorem ipsum dolor sit amet, consectetur adipisicing elit. Iusto,
            perferendis!
          </p>
        </div>
      </div>
      <div className={styles.profile}>
        <img className={styles.profile_img} src="portitem1.jpeg" alt="" />
        <div className={styles.user}>
          <div className={styles.user_header}>
            <h2>contact</h2>
            <p>2:11</p>
          </div>
          <p>
            Lorem ipsum dolor sit amet, consectetur adipisicing elit. Iusto,
            perferendis!
          </p>
        </div>
      </div>
      <div className={styles.profile}>
        <img className={styles.profile_img} src="portitem1.jpeg" alt="" />
        <div className={styles.user}>
          <div className={styles.user_header}>
            <h2>contact</h2>
            <p>2:11</p>
          </div>
          <p>
            Lorem ipsum dolor sit amet, consectetur adipisicing elit. Iusto,
            perferendis!
          </p>
        </div>
      </div>
      <div className={styles.profile}>
        <img className={styles.profile_img} src="portitem1.jpeg" alt="" />
        <div className={styles.user}>
          <div className={styles.user_header}>
            <h2>contact</h2>
            <p>2:11</p>
          </div>
          <p>
            Lorem ipsum dolor sit amet, consectetur adipisicing elit. Iusto,
            perferendis!
          </p>
        </div>
      </div>
    </div>
  );
};

export default Main;