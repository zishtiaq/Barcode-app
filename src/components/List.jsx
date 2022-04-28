import {
  Card,
  Checkbox,
  Heading,
  Tooltip,
  Icon,
  Layout,
  Button,
} from "@shopify/polaris";
import Barcode from "react-barcode";
import { DragHandleMinor } from "@shopify/polaris-icons";
import {
  DragDropContext,
  Droppable,
  Draggable,
  resetServerContext,
} from "react-beautiful-dnd";
import { useState, useCallback } from "react";
import { authenticatedFetch } from "@shopify/app-bridge-utils";

import "./list.scss";
import axios from "axios";

export function List({ variant }) {
  console.log(variant);
  const fetchFunction = authenticatedFetch(app);

  const [loading, setLoading] = useState(false);
  const [list, setList] = useState([
    {
      id: "displayName",
      name: "Title with options",
      checked: true,
      value: variant.displayName,
    },
    { id: "barcode", name: "Barcode", checked: true, value: variant.barcode },
    { id: "price", name: "Price", checked: true, value: "$" + variant.price },
  ]);
  const postField = (e) => {
    setLoading(true);
    axios(`/pdf`, {
      method: "POST",
      data: list,
      responseType: "blob",
    })
      .then((response) => {
        setLoading(false);
        console.log(response.data);
        const file = new Blob([response.data], { type: "application/pdf" });
        //Build a URL from the file
        const fileURL = URL.createObjectURL(file);
        //Open the URL on new Window
        window.open(fileURL);
      })
      .catch((e) => {
        console.log(e);
      });
  };

  resetServerContext();
  const handleDragEnd = useCallback(({ source, destination }) => {
    setList((oldList) => {
      const newList = oldList.slice(); // Duplicate
      const [temp] = newList.splice(source.index, 1);
      newList.splice(destination.index, 0, temp);
      return newList;
    });
  }, []);
  return (
    <Layout>
      <Layout.Section oneHalf>
        <Card sectioned>
          <Heading size="medium">Fields</Heading>
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="root">
              {(provided) => {
                return (
                  <div ref={provided.innerRef} {...provided.droppableProps}>
                    {list.map((item, index) => (
                      <ListItem
                        key={item.id}
                        id={item.id}
                        index={index}
                        item={item}
                        list={list}
                        setList={setList}
                      />
                    ))}
                    {provided.placeholder}
                  </div>
                );
              }}
            </Droppable>
          </DragDropContext>
        </Card>
      </Layout.Section>
      <Layout.Section oneHalf>
        <Card sectioned>
          <Heading size="medium">Preview</Heading>
          <div class="barcode__preview">
            {list.map((single, index) => {
              return (
                <>
                  {single.checked && single.name == "Barcode" && (
                    <Barcode
                      value={single.value}
                      format="CODE39"
                      height={40}
                      font="Arial"
                    />
                  )}
                  {single.checked && single.name !== "Barcode" && (
                    <h4 className={single.name.replaceAll(" ", "-")}>
                      {single.value}
                    </h4>
                  )}
                </>
              );
            })}
          </div>
        </Card>
      </Layout.Section>
      <Layout.Section>
        <Button primary loading={loading} onClick={(e) => postField(e)}>
          Print
        </Button>
      </Layout.Section>
    </Layout>
  );
}

function ListItem(props) {
  const { item, index, id, list, setList } = props;
  const handleChecked = (index) => {
    setList((oldList) => {
      let newList = oldList.slice(); // Duplicate
      newList[index].checked = !newList[index].checked;
      return newList;
    });
  };
  return (
    <Draggable key={id} draggableId={id} index={index}>
      {(provided, snapshot) => {
        return (
          <div
            className="list__item"
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
          >
            <div {...provided.dragHandleProps} className="list__item__icon">
              <Tooltip content="Drag to reorder list items">
                <Icon source={DragHandleMinor} color="inkLightest" />
              </Tooltip>
            </div>
            <Checkbox
              id={item.id}
              key={index}
              label={item.name}
              value={item.value}
              name={item.name}
              checked={item.checked}
              onChange={() => handleChecked(index)}
            />
          </div>
        );
      }}
    </Draggable>
  );
}
