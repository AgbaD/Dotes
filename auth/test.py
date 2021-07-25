#!/usr/bin/python3
# Author:   @AgbaD || @agba_dr3

from app import app
import unittest


class AuthTest(unittest.TestCase):

    def test_get_login(self):
        tester = app.test_client(self)
        response = tester.get("/login")
        status_code = response.status_code
        self.assertEqual(status_code, 400)




if __name__ == "__main__":
    unittest.main()
