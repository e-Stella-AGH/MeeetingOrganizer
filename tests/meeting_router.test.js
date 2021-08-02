const request = require("supertest");
const db = require("../db/relations")
const {sequelize} = require("../db/sequelizer")
const app = require("../app");

const body = {
    "duration": 15,
    "hosts": ["aba@aba.pl","ccc@ccc.pl"],
    "guest": "a@a.pl"
}

const updatedBody = {
    "duration": 30,
    "hosts": ["aa@aa.pl","bbb@bbb.pl"],
    "guest": "b@b.pl"
}

const pickedTimeSlot = {
    "startTime": new Date(2021, 5, 25, 14,30),
    "duration": 30
}

const firstTimeSlots = [
    {
        startDatetime: new Date(2021, 5, 23, 11),
        duration: 120
    },
    {
        startDatetime: new Date(2021, 5, 23, 14),
        duration: 60
    },
    {
        startDatetime: new Date(2021, 5, 25, 12),
        duration: 300
    }
]

const secondTimeSlots = [
    {
        startDatetime: new Date(2021, 5, 23, 12),
        duration: 240
    },
    {
        startDatetime: new Date(2021, 5, 25, 13),
        duration: 120
    }
]

const uuid = "ad18668e-4a28-4565-9f4a-4eace3068a62"

const BAD_REQUEST_CODE = 400

describe("Test the POST meeting", () => {


    beforeAll(async () => {
        await sequelize.sync()
      })
    
    test("It should respond that the meeting was added", done => {
      request(app).post("/meeting")
        .send(body)
        .then(response => {
          expect(response.statusCode).toBe(200)
          expect(response.body.msg).toBe("Meeting added")
          done()
        })
    })
    
    test("It should respond that guest mail is incorrect", done => {
      request(app).post("/meeting")
        .send({...body, guest: "aa.pl"})
        .then(response => {
          expect(response.statusCode).toBe(BAD_REQUEST_CODE)
          expect(response.body.msg).toBe("Guest mail is not valid mail")
          done()
        })
    })

    test("It should respond that there are no hosts", done => {
      request(app).post("/meeting")
        
        .send({...body, hosts: []})
        .then(response => {
          expect(response.statusCode).toBe(BAD_REQUEST_CODE)
          expect(response.body.msg).toBe("There must be at least one host in the meeting")
          done()
        })
    })

    test("It should respond that the hosts mail is incorrect", done => {
      request(app).post("/meeting")
        .send({...body, hosts: ["aba@aba.pl","cccccc.pl"]})
        .then(response => {
          expect(response.statusCode).toBe(BAD_REQUEST_CODE)
          expect(response.body.msg).toBe("These are not valid mails: cccccc.pl")
          done()
        })
    })
    test("It should respond that the duration is not integer", done => {
      request(app).post("/meeting")
        .send({...body, duration: "ala"})
        .then(response => {
          expect(response.statusCode).toBe(BAD_REQUEST_CODE)
          expect(response.body.msg).toBe("Duration is not proper integer")
          done()
        })
    })
    test("It should respond that the uuid is incorrect", done => {
      request(app).post("/meeting")
        .send({...body, uuid: "alazzascxzcx"})
        .then(response => {
          expect(response.statusCode).toBe(BAD_REQUEST_CODE)
          expect(response.body.msg).toBe("Not proper UUID")
          done()
        })
    })


    test("It should respone that the meeting was added with uuid", done => {
        request(app).post("/meeting")
        
        .send({...body, uuid: uuid})
        .then(response => {
            expect(response.statusCode).toBe(200)
            expect(response.body.msg).toBe("Meeting added")
            done()
          })
      })
})

describe("Test the PUT meeting", () => {


    
    test("It should respond the correct PUT", done => {
      request(app).put("/meeting/"+uuid)
        .send(updatedBody)
        .then(response => {
          expect(response.statusCode).toBe(200)
          expect(response.body.msg).toBe("Meeting updated")
          return db.models.Meeting.findByPk(uuid)
        })
        .then(meeting => {
          expect(meeting.duration).toBe(updatedBody.duration)
          return Promise.all([meeting.getGuest(),meeting.getHosts()])
        })
        .then(data => {
          const guest = data[0];
          expect(guest.email).toBe(updatedBody.guest)
          const hostsMails = data[1].map(host => host.email)
          expect(JSON.stringify(hostsMails.sort())).toBe(JSON.stringify(updatedBody.hosts.sort()))
          done()
        })
    })
    
    test("It should respond that guest mail is incorrect", done => {
      request(app).put("/meeting/"+uuid)
        
        .send({...body, "guest": "aa.pl"})
        .then(response => {
          expect(response.statusCode).toBe(BAD_REQUEST_CODE)
          expect(response.body.msg).toBe("Guest mail is not valid mail")
          done()
        })
    })

    test("It should respond that there are no hosts", done => {
      request(app).put("/meeting/"+uuid)
        .send({...body, "hosts": []})
        .then(response => {
          expect(response.statusCode).toBe(BAD_REQUEST_CODE)
          expect(response.body.msg).toBe("There must be at least one host in the meeting")
          done()
        })
    })

    test("It should respond that the hosts mail is incorrect", done => {
      request(app).put("/meeting/"+uuid)
        .send({...body, "hosts": ["aba@aba.pl","cccccc.pl"]})
        .then(response => {
          expect(response.statusCode).toBe(BAD_REQUEST_CODE)
          expect(response.body.msg).toBe("These are not valid mails: cccccc.pl")
          done()
        })
    })
    test("It should respond that the duration is not integer", done => {
      request(app).put("/meeting/"+uuid)
        .send({...body, "duration": "ala"})
        .then(response => {
          expect(response.statusCode).toBe(BAD_REQUEST_CODE)
          expect(response.body.msg).toBe("Duration is not proper integer")
          done()
        })
    })
    test("It should respond that the meeting has been reserved", done => {
        request(app).put("/meeting/"+uuid+"/pick_time_slot")
            .send(pickedTimeSlot)
            .then(response => {
                expect(response.statusCode).toBe(200)
                expect(response.body.msg).toBe("Meeting reserved")
                return db.models.Meeting.findByPk(uuid)
                })
            .then(meeting => {
                expect(meeting.startTime.getTime()).toBe(pickedTimeSlot.startTime.getTime())
                done()
            })
    })
  })

describe("Test the DELETE meeting", () => {
    test("It should respond the correct DELETE", done => {
        request(app).delete("/meeting/"+uuid)
          .then(response => {
            expect(response.statusCode).toBe(200)
            expect(response.body.msg).toBe("Meeting deleted")
            done()
          })
      })

  })