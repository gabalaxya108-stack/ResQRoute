CXX = clang++
CXXFLAGS = -std=c++17 -Wall -Wextra -O2

all: resqroute

resqroute: main.cpp resqroute.hpp
	$(CXX) $(CXXFLAGS) main.cpp -o resqroute

test: resqroute
	./resqroute

clean:
	rm -f resqroute

.PHONY: all test clean

