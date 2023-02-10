import { useState, useEffect } from "react";
import { Modal } from "antd";
import axios from "axios";
import moment from "moment";
const url = "http://localhost:8888";
// const url = "https://calendar-weekly.netlify.app"
const UpcomingEventsModal = ({ showEventsModal, setShowEventsModal }) => {
  const [events, setEvents] = useState([]);
  useEffect(() => {
    fetchEvents();
  }, []);
  const fetchEvents = async () => {
    try {
      const response = await axios.get(
        `${url}/.netlify/functions/getUpcomingEvents`
      );
      console.log("upcomin events response-->", response.data);
      setEvents(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Modal
      title={"Upcoming Events"}
      centered
      open={showEventsModal}
      okButtonProps={{ style: { display: "none" } }}
      cancelButtonProps={{ style: { display: "none" } }}
      onCancel={() => setShowEventsModal(!showEventsModal)}
      style={{
        minHeight: "min-content",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          height : "350px",
          minHeight: "max-content",
          overflowY : "scroll"
        }}
      >
        {!!events.length &&
          events.map((e) => (
            <div
              style={{
                backgroundColor: `${e.color}`,
                boxShadow: "0px 0px 5px rgba(0, 0, 0, 0.3)",
                marginTop: "15px",
                padding: "10px",
                width: "80%",
                borderRadius: "5px"
                // opacity: "0.8",
              }}
            >
              {/* {console.log(moment(e.startAt, "YYYY/MM/DD HH:mm"))} */}
              <b>
                {moment(e.startAt).format("MMM DD HH:mm")} - {e.summary}
              </b>
            </div>
          ))}
      </div>
    </Modal>
  );
};

export default UpcomingEventsModal;
