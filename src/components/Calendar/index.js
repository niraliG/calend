import React, { useEffect, useState } from "react";
import Kalend, { CalendarView } from "kalend";
import {
  Button,
  Modal,
  DatePicker,
  Form,
  Input,
  Select,
  FloatButton,
} from "antd";
import {
  PlusOutlined,
  ClockCircleOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import "kalend/dist/styles/index.css";
import axios from "axios";
import UpcomingEventsModal from "../UpcomingEventsModal";
import { utcToIst, colors, ColorSelect } from "../../utils";
import dayjs from "dayjs";
import moment from "moment";

// const url = "http://localhost:8888";
const url = "https://calendar-weekly.netlify.app"
function getColor() {
  return colors[Math.floor(Math.random() * colors.length - 1) + 1];
}
const Calendar = (props) => {
  const [events, setEvents] = useState([]);
  const [toggleModal, setToggleModal] = useState({
    open: false,
    type: "",
  });
  const [showEventsModal, setShowEventsModal] = useState(false);
  const [id, setId] = useState(null);
  const config = {
    rules: [
      {
        type: "object",
        required: true,
        message: "Please select time!",
      },
    ],
  };
  const [form] = Form.useForm();
  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await axios.get(
        `${url}/.netlify/functions/getEventList`
      );
      setEvents(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  //callback after new event is created by dragging action
  const onNewEventClick = (data) => {
    // console.log("event is being created", data);
    const eventObj = {
      startAt: data.startAt,
      endAt: data.endAt,
      summary: "New Event",
      color: getColor(),
    };
    addEvent(eventObj);
  };

  const onEventClick = (data) => {
    // console.log("on Event Click", data);
    form.setFieldsValue({
      summary: data.summary,
      startAt: dayjs(utcToIst(data.startAt), "YYYY/MM/DD HH:mm"),
      endAt: dayjs(utcToIst(data.endAt), "YYYY/MM/DD HH:mm"),
      color: data.color,
    });
    setId(data.id);
    setToggleModal({ open: true, type: "update" });
  };

  // Callback after drag and drop is finished
  const onEventDragFinish = (prev, current, data) => {
    const eventObj = {
      id: current.id,
      startAt: current.startAt,
      endAt: current.endAt,
      summary: current.summary,
      color: current.color,
    };
    // console.log("on drag finish prev", prev);
    // console.log("on drag finish current", current);
    updateEvent(eventObj);
  };

  const addEvent = async (eventObj) => {
    // const randomPositive = () => Math.floor(Math.random() * 100) + 1;
    // const num = randomPositive();
    // setEvents((prev) => [...prev, { ...eventObj, id: num }]);
    try {
      const response = await axios.post(
        `${url}/.netlify/functions/addEvent`,
        eventObj,
        {
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        }
      );
      // console.log("created event response", response);
      if (response.status === 200) {
        setToggleModal({ ...toggleModal, open: false });
        setEvents((prev) => [...prev, eventObj]);
        fetchEvents();
      }
    } catch (error) {
      console.error(error);
    }
  };
  const updateEvent = async (eventObj) => {
    // console.log("updating event object-->", eventObj);
    try {
      const response = await axios.put(
        `${url}/.netlify/functions/updateEvent`,
        eventObj,
        {
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        }
      );
      // console.log("updated event response", response);
      if (response.status === 200) {
        setToggleModal({ ...toggleModal, open: false });
        fetchEvents();
      }
    } catch (error) {
      console.error(error);
    }
  };

  const scheduleEvent = async (values) => {
    const { summary, startAt, endAt, color } = values;
    // console.log("schedule event ", values);
    const eventObj = {
      summary: summary || "Summary",
      startAt: moment(startAt.$d).format("YYYY-MM-DD HH:mm:ss"),
      endAt: moment(endAt.$d).format("YYYY-MM-DD HH:mm:ss"),
      color: color || "seagreen",
    };
    if (toggleModal.type === "add") {
      addEvent(eventObj);
    } else {
      updateEvent({ ...eventObj, id: id });
    }
  };

  const deleteEvent = async () => {
    // console.log("deleting event---id", id);
    try {
      const response = await axios.delete(
        `${url}/.netlify/functions/deleteEvent`,
        { data: { id: id } },
        {
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        }
      );
      if (response.status === 200) {
        setToggleModal({ ...toggleModal, open: false });
        fetchEvents();
      }
    } catch (error) {
      console.error(error);
    }
  };
  return (
    <>
      <Kalend
        kalendRef={props.kalendRef}
        onNewEventClick={onNewEventClick}
        initialView={CalendarView.WEEK}
        disabledViews={[
          CalendarView.DAY,
          CalendarView.MONTH,
          CalendarView.THREE_DAYS,
          CalendarView.AGENDA,
        ]}
        onEventClick={onEventClick}
        events={events}
        initialDate={new Date().toISOString()}
        hourHeight={60}
        timezone={"Asia/Kolkata"}
        onEventDragFinish={onEventDragFinish}
        onStateChange={props.onStateChange}
        selectedView={props.selectedView}
        showTimeLine={true}
        isDark={false}
        autoScroll={true}
      />
      <Modal
        title={
          toggleModal.type === "add" ? "Schedule Event" : "Reschedule Event"
        }
        centered
        open={toggleModal.open}
        okButtonProps={{ style: { display: "none" } }}
        cancelButtonProps={{ style: { display: "none" } }}
        onCancel={() =>
          setToggleModal({ ...toggleModal, open: !toggleModal.open })
        }
      >
        <Form
          form={form}
          labelCol={{
            span: 4,
          }}
          wrapperCol={{
            span: 14,
          }}
          layout="horizontal"
          initialValues={{
            size: "default",
          }}
          size={"default"}
          style={{
            maxWidth: 600,
            marginTop: 15,
            minHeight: 250,
          }}
          onFinish={scheduleEvent}
        >
          <Form.Item name="summary" label="Summary">
            <Input />
          </Form.Item>

          <Form.Item name="startAt" label="From" {...config}>
            <DatePicker
              format={"YYYY/MM/DD HH:mm"}
              showTime={{ format: "HH:mm" }}
            />
          </Form.Item>
          <Form.Item name="endAt" label="To" {...config}>
            <DatePicker
              format={"YYYY/MM/DD HH:mm"}
              showTime={{ format: "HH:mm" }}
            />
          </Form.Item>
          <Form.Item name="color" label="Color">
            <Select>{ColorSelect()}</Select>
          </Form.Item>
          <Button type="primary" htmlType="submit" style={{ float: "right" }}>
            {toggleModal.type === "add" ? "Create Event" : "Update Event"}
          </Button>
          {toggleModal.type === "update" && (
            <Button
              type="primary"
              onClick={deleteEvent}
              style={{ backgroundColor: "crimson" }}
            >
              <DeleteOutlined />
              Delete Event
            </Button>
          )}
        </Form>
      </Modal>
      <FloatButton
        shape="circle"
        type="primary"
        tooltip={<div>Show Upcoming Events</div>}
        style={{
          position: "fixed",
          top: 16,
          right: 80,
          zIndex: 1,
          width: 50,
          height: 50,
        }}
        icon={<ClockCircleOutlined />}
        onClick={() => setShowEventsModal(true)}
      />
      <FloatButton
        shape="circle"
        type="primary"
        tooltip={<div>Create Event</div>}
        style={{
          position: "fixed",
          top: 16,
          right: 24,
          zIndex: 1,
          width: 50,
          height: 50,
        }}
        icon={<PlusOutlined />}
        onClick={() => {
          setId(null);
          form.setFieldsValue({
            summary: "",
            startAt: "",
            endAt: "",
            color: "",
          });
          setToggleModal({ open: true, type: "add" });
        }}
      />
      {!!showEventsModal && (
        <UpcomingEventsModal
          showEventsModal={showEventsModal}
          setShowEventsModal={setShowEventsModal}
        />
      )}
    </>
  );
};
export default Calendar;
