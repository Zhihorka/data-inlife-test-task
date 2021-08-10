import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect,
  Link,
} from "react-router-dom";
import style from "./style.module.css";

//элемент для отображения сроки в таблице
const RenderRow = (props) => {
  return props.keys.map((key, index) => {
    return (
      <div className={style.tableRow}>
        <td key={props.data[key]}>{props.data[key]} </td>
      </div>
    );
  });
};
//функция добавления продукта в корзину 
//я не смог разобрать в каком виде отправлять 
//body с пост-запросом product[Идентификатор товара]:Количество
const addToCart = (id, amount, setCart) => {
  let body = {
    product: {
      id: id,
      amount: amount,
    },
  };
  setCart((oldArray) => [...oldArray, { id: id, amount: amount }]);
  fetch("https://datainlife.ru/junior_task/add_basket.php", {
    method: "POST",
    body: JSON.stringify(body),
  })
    .then((response) => {
      let json = response.json();
      console.log("ответ на добавление в корзину");
      console.log(json);
      if (!response.ok) {
        throw new Error("нет ответа json");
      }
      return response.blob();
    })
    .catch((error) => {
      console.error("сработал кэтч ", error);
    });
};


//панель корзины снизу
const Cart = (cart) => {
  const [isToggle, setToggle] = useState(false);

  const cartContent = Array.from(Object.values(cart)).map((product) => {
    <div>
      <p>{product.id}</p>
      <p>{product.amount}</p>
    </div>;
  });
  return (
    <div className={style.stickTo__bottom}>
      <div className={isToggle ? style.cart__fullSize : style.cart}>
        <div className={style.cartState}>
          <p>{`Сейчас в корзине ${cart.length} товаров`}</p>
        </div>
        <div
          className={style.toggleSwitch}
          onClick={() => setToggle(!isToggle)}
        >
          {isToggle ? <p>закрыть</p> : <p>открыть</p>}{" "}
        </div>
        <div className={style.purchasesList}>{cartContent}</div>
      </div>
    </div>
  );
};
//интерактивные элементы для таблицы
const InteractionBlock = (price, id, setCart) => {
  const [amount, setAmount] = useState(1);
  const [onePiecePrice, setOnePiecePrice] = useState(price);
  const [totalPrice, setTotalPrice] = useState(0);

  return (
    <div className={style.interactionBlock}>
      <div className={style.quantitySelector} key="количество">
        <div
          className={style.button_rounded}
          onClick={() => {
            amount > 0 ? setAmount(amount - 1) : setAmount(amount);
          }}
        >
          -
        </div>
        <div className={style.button_rounded}>{amount}</div>
        <div
          className={style.button_rounded}
          onClick={() => setAmount(amount + 1)}
        >
          +
        </div>
      </div>
      <div className={style.button_rounded} key="сумма">
        {amount * parseInt(Object.values(onePiecePrice), 10)}
      </div>
      <div
        className={style.addToCart}
        key="сумма"
        onClick={() => {
          addToCart(id, amount, (product) => setCart(product));
        }}
      >
        {"В корзину"}
      </div>
    </div>
  );
};
//главный элемент таблицы
class Table extends React.Component {
  constructor(props) {
    super(props);
    this.getHeader = this.getHeader.bind(this);
    this.getRowsData = this.getRowsData.bind(this);
    this.getKeys = this.getKeys.bind(this);
  }

  getKeys = function () {
    return ["gid", "gnote", "gprice"];
  };

  getHeader = function () {
    var keys = this.getKeys();
    return keys.map((key, index) => {
      return <th key={key}>{key.toUpperCase()}</th>;
    });
  };

  getRowsData = function () {
    var items = this.props.data;
    var keys = this.getKeys();
    return items.map((row, index) => {
      return (
        <tr key={index}>
          <RenderRow key={index} data={row} keys={keys} />
          {console.log("информация в строке = ")}
          {console.log(row)}
          <InteractionBlock
            price={row.gprice}
            id={row.rid}
            setCart={this.props.setCart}
          />
        </tr>
      );
    });
  };

  render() {
    return (
      <div>
        <table>
          <thead>
            <tr>{this.getHeader()}</tr>
          </thead>
          <tbody>{this.getRowsData()}</tbody>
        </table>
      </div>
    );
  }
}
//навигация по разделам товаров
const SubsectionNav = (onClick, subsections) => {
  const subsectionsList = localStorage.getItem("subsections").split(",");
  const filteredSubsectionsList = subsectionsList.filter(
    (subsection) => subsection.length > 4
  );
  const subsectionsIdsList = localStorage.getItem("subsectionsIds").split(",");

  return (
    <div className={style.stickTo__left}>
      <div className={style.navBar}>
        <div onClick={onClick}>
          {filteredSubsectionsList.map((subsection, i) => (
            <Link to={`/${subsectionsIdsList[i]}`} className={style.link}>
              <div className={style.option}>{subsection}</div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};
//функция получения id подраздела для того чтобы получать список товаров
//только для нужного раздела
const updateId = () => {
  var URL = window.location.href;
  const formattedURL = URL.split("/");
  return formattedURL.slice(-1)[0];
};


//корневой компонент
const Catalog = () => {
  const [ids, setIds] = useState([]);
  const [currentId, setId] = useState(updateId);
  const [goods, setGoods] = useState([]);
  const [subsectionList, setSubsectionList] = useState([]);
  const [cart, addToCart] = useState([]);

  useEffect(() => {
    async function initialFetch() {
      const response = await fetch(
        "https://datainlife.ru/junior_task/get_products.php"
      );
      var temporaryList = [];
      var idsList = [];
      const json = await response.json();
      Array.from(json).forEach((subsection, i) => {
        temporaryList.push(subsection.rname);
        idsList.push(subsection.rid);
      });
      temporaryList.pop();
      idsList.pop();
      var temporaryListFormatted = Array.from(Object.values(temporaryList));
      setIds(idsList);
      localStorage.setItem("subsections", temporaryListFormatted);
      localStorage.setItem("subsectionsIds", idsList);
      temporaryListFormatted.forEach((subsection) => {
        setSubsectionList((oldList) => [...oldList, subsection]);
      });
    }

    initialFetch();
    const subsectionsList = localStorage.getItem("subsections").split(",");
    const filteredSubsectionsList = subsectionsList.filter(
      (subsection) => subsection.length > 4
    );
    setIds(localStorage.getItem("subsectionsIds").split(","));
    setSubsectionList(filteredSubsectionsList);
  }, []);

  useEffect(() => {
    async function fetchData() {
      const response = await fetch(
        "https://datainlife.ru/junior_task/get_products.php"
      );
      const json = await response.json();
      console.log("изначальный вариант");
      console.log(Array.from(json));
      var result = Array.from(json).filter((obj) => {
        return obj.rid === currentId;
      });

      setGoods(Array.from(result[0].goods));
    }
    fetchData();
  }, currentId);

  return (
    <Router>
      <div className={style.grid}>
        <Cart cart={cart} />
        <SubsectionNav
          onClick={() => setId("220")}
          subsections={subsectionList}
        />
        <div className={style.styledFrame}>
          <Switch>
            <Route
              exact
              path="/"
              render={() => {
                return <Redirect to={`/${ids[0]}`} />;
              }}
            />
            {subsectionList.map((subsection, i) => (
              <Route exact path={`/${ids[i]}`}>
                <Table data={goods} subsectionId={ids[i]} />
              </Route>
            ))}
          </Switch>
        </div>
      </div>
    </Router>
  );
};

export default Catalog;
